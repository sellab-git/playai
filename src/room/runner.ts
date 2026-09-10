import type { Acknowledgement, GameEntry, Intent, Player, PlayerId, Snapshot } from '../engine';
import type { Aggregate, Connection, DurableRecord, RunnerDependencies } from './types';
import { canonicalJson, isJson, parseIntent, validProfile } from './validation';

export type RunnerResult<T> = { ok: true; value: T } | { ok: false; code: string };
const ok = <T>(value: T): RunnerResult<T> => ({ ok: true, value });
const err = <T>(code: string): RunnerResult<T> => ({ ok: false, code });

function clone<T>(value: T): T { return structuredClone(value); }
function setOwn<T>(record: Record<string, T>, key: string, value: T): void {
  Object.defineProperty(record, key, { value, enumerable: true, configurable: true, writable: true });
}
function rng(seed: number, transition: number): () => number {
  let state = (seed ^ Math.imul(transition + 1, 0x9e3779b1)) >>> 0;
  return () => { state += 0x6d2b79f5; let value = state; value = Math.imul(value ^ value >>> 15, value | 1); value ^= value + Math.imul(value ^ value >>> 7, value | 61); return ((value ^ value >>> 14) >>> 0) / 4294967296; };
}

export class RoomRunner {
  private current: DurableRecord | null;
  private changed = false;
  constructor(record: DurableRecord | null, private readonly deps: RunnerDependencies) { this.current = clone(record); }
  get record(): DurableRecord | null { return clone(this.current); }
  get dirty(): boolean { return this.changed; }
  get nextAlarm(): number | null { return this.aggregate()?.alarm?.at ?? null; }

  create(code: string): RunnerResult<void> {
    if (this.current !== null) return err('room.exists');
    if (!/^[A-Z0-9]{5}$/.test(code)) return err('room.code');
    const now = this.deps.now();
    this.current = { kind: 'room', value: { version: 1, room: { code, createdAt: now, hostId: null, players: [], status: 'lobby', gameId: null, totals: {}, gamesPlayed: 0, gamesStarted: 0 }, memberships: {}, game: null, outcomes: {}, awards: {}, hostDeadline: null, insufficientDeadline: null, alarm: null, notice: null, lastActivity: now } };
    this.changed = true; this.schedule(); return ok(undefined);
  }

  join(profile: unknown, credentialHash: string): RunnerResult<PlayerId> {
    const aggregate = this.aggregate();
    if (!aggregate) return err(this.current?.kind === 'tombstone' ? 'room.closed' : 'room.missing');
    if (aggregate.room.status === 'closed') return err('room.closed');
    if (aggregate.room.status !== 'lobby') return err('room.inProgress');
    if (!validProfile(profile) || !/^[a-f0-9]{64}$/i.test(credentialHash)) return err('join.invalid');
    if (Object.values(aggregate.memberships).some(item => item.credentialHash === credentialHash)) return err('join.credentialUsed');
    if (aggregate.room.players.filter(player => !player.departed).length >= 20) return err('room.full');
    const now = this.deps.now(), id = this.deps.id();
    const player: Player = { id, name: profile.name.trim(), faceId: profile.faceId, tile: profile.tile, joinedAt: now, lastSeenAt: now, connected: false, departed: false };
    aggregate.room.players.push(player); setOwn(aggregate.room.totals, id, 0);
    setOwn(aggregate.memberships, id, { credentialHash, generation: 0, revoked: false, ready: false }); setOwn(aggregate.outcomes, id, {});
    if (aggregate.room.hostId === null) { aggregate.room.hostId = id; aggregate.hostDeadline = now + 30_000; }
    this.mutate(); return ok(id);
  }

  connect(credentialHash: string): RunnerResult<Connection> {
    this.advance(); const aggregate = this.aggregate(); if (!aggregate || aggregate.room.status === 'closed') return err('auth.invalid');
    const found = Object.entries(aggregate.memberships).find(([, membership]) => !membership.revoked && membership.credentialHash === credentialHash);
    if (!found) return err('auth.invalid');
    const [playerId, membership] = found; membership.generation += 1; membership.ready = false;
    const player = this.player(playerId)!; player.connected = true; player.lastSeenAt = this.deps.now(); aggregate.lastActivity = this.deps.now();
    if (aggregate.room.hostId === null) aggregate.room.hostId = this.electHost();
    if (aggregate.room.hostId === playerId) aggregate.hostDeadline = null;
    this.updateInsufficient(); this.mutate(); return ok({ playerId, generation: membership.generation });
  }

  disconnect(connection: Connection): RunnerResult<void> {
    const aggregate = this.auth(connection); if (!aggregate) return err('auth.staleConnection');
    const player = this.player(connection.playerId)!; player.connected = false; player.lastSeenAt = this.deps.now(); aggregate.lastActivity = this.deps.now();
    if (aggregate.room.hostId === connection.playerId) aggregate.hostDeadline = this.deps.now() + 30_000;
    this.updateInsufficient(); this.mutate(); return ok(undefined);
  }

  ready(connection: Connection, ready = true): RunnerResult<void> {
    const aggregate = this.auth(connection); if (!aggregate) return err('auth.staleConnection');
    aggregate.memberships[connection.playerId]!.ready = ready; this.touchInternal(connection.playerId); this.mutate(); return ok(undefined);
  }
  touch(connection: Connection): RunnerResult<void> { const aggregate = this.auth(connection); if (!aggregate) return err('auth.staleConnection'); this.touchInternal(connection.playerId); this.mutate(); return ok(undefined); }

  intent(connection: Connection, raw: unknown): Acknowledgement {
    const parsed = parseIntent(raw); const actionId = parsed?.actionId ?? (typeof raw === 'object' && raw !== null && 'actionId' in raw && typeof raw.actionId === 'string' ? raw.actionId : '');
    let aggregate = this.auth(connection);
    if (!aggregate) return { actionId, accepted: false, code: 'auth.staleConnection', version: this.aggregate()?.version ?? 0 };
    this.advance(); aggregate = this.auth(connection);
    if (!aggregate) return { actionId, accepted: false, code: 'auth.staleConnection', version: this.aggregate()?.version ?? 0 };
    if (!parsed) {
      if (!/^[A-Za-z0-9_-]{1,128}$/.test(actionId) || !isJson(raw)) return this.ack(aggregate, connection.playerId, actionId, false, 'intent.invalid', null);
      const fingerprint = canonicalJson(raw);
      const ledger = aggregate.outcomes[connection.playerId];
      const prior = ledger && Object.hasOwn(ledger, actionId) ? ledger[actionId] : undefined;
      if (prior) return prior.fingerprint === fingerprint ? clone(prior.ack) : { actionId, accepted: false, code: 'intent.conflict', version: aggregate.version };
      return this.ack(aggregate, connection.playerId, actionId, false, 'intent.invalid', fingerprint);
    }
    const fingerprint = canonicalJson(parsed.command);
    const ledger = aggregate.outcomes[connection.playerId];
    const prior = ledger && Object.hasOwn(ledger, parsed.actionId) ? ledger[parsed.actionId] : undefined;
    if (prior) return prior.fingerprint === fingerprint ? clone(prior.ack) : { actionId: parsed.actionId, accepted: false, code: 'intent.conflict', version: aggregate.version };
    if (aggregate.room.status === 'closed') return this.ack(aggregate, connection.playerId, parsed.actionId, false, 'room.closed', fingerprint);
    const result = this.applyIntent(aggregate, connection, parsed);
    if (this.current?.kind !== 'room') return result;
    return this.ack(this.current.value, connection.playerId, parsed.actionId, result.accepted, result.code, fingerprint);
  }

  advance(): void {
    const wallNow = this.deps.now();
    for (let guard = 0; guard < 64; guard += 1) {
      const aggregate = this.aggregate(); if (!aggregate) return;
      const game = aggregate.game?.status === 'active' ? aggregate.game : null;
      const entry = game && Object.hasOwn(this.deps.games, game.gameId) ? this.deps.games[game.gameId] : undefined;
      const phase = game && entry ? entry.phase(game.state) : null;
      const cleanupAt = Math.max(aggregate.room.createdAt + 8 * 60 * 60_000, aggregate.lastActivity + 60 * 60_000);
      const events: Array<{ at: number; priority: number; type: 'host' | 'safety' | 'game' | 'cleanup' }> = [];
      if (aggregate.hostDeadline !== null) events.push({ at: aggregate.hostDeadline, priority: 0, type: 'host' });
      if (aggregate.insufficientDeadline !== null && game) events.push({ at: aggregate.insufficientDeadline, priority: 1, type: 'safety' });
      if (phase?.endsAt !== null && phase?.endsAt !== undefined) events.push({ at: phase.endsAt, priority: 2, type: 'game' });
      events.push({ at: cleanupAt, priority: 3, type: 'cleanup' });
      events.splice(0, events.length, ...events.filter(event => event.at <= wallNow).sort((left, right) => left.at - right.at || left.priority - right.priority));
      const event = events[0]; if (!event) { this.schedule(); return; }
      if (event.type === 'host') { aggregate.hostDeadline = null; aggregate.room.hostId = this.electHost(); this.mutate(); continue; }
      if (event.type === 'safety') { this.abort(aggregate, 'game.insufficientPlayers'); this.mutate(); continue; }
      if (event.type === 'cleanup') { this.current = { kind: 'tombstone' }; this.changed = true; return; }
      if (!game || !entry || !phase) { this.schedule(); return; }
      const reduced = entry.reduce(game.state, { type: 'TICK' }, { actor: null, hostId: aggregate.room.hostId, now: event.at, rng: rng(game.seed, game.transition) });
      if (!reduced.accepted) { this.schedule(); return; }
      game.state = reduced.state; game.transition += 1; const after = entry.phase(game.state);
      if (after.token !== phase.token) game.phaseEpoch += 1; game.phaseToken = after.token; this.finishIfNeeded(aggregate, entry); this.mutate();
      if (after.token === phase.token) { this.schedule(); return; }
    }
    this.schedule();
  }

  snapshot(connection: Connection): Snapshot | null {
    const aggregate = this.auth(connection); if (!aggregate) return null;
    const game = aggregate.game; let projected: Snapshot['game'] = null;
    if (game && game.roster.includes(connection.playerId)) {
      const entry = Object.hasOwn(this.deps.games, game.gameId) ? this.deps.games[game.gameId] : undefined; if (!entry) return null;
      const safe = game.status === 'completed' ? game.result : null;
      projected = { gameId: game.gameId, scope: { gameInstanceId: game.id, phaseEpoch: game.phaseEpoch, roundId: (safe?.phase ?? entry.phase(game.state)).roundId }, phase: clone(safe?.phase ?? entry.phase(game.state)), public: clone(safe?.public ?? entry.publicView(game.state, this.rosterPlayers(game.roster))), private: clone(safe?.private[connection.playerId] ?? entry.privateView(game.state, connection.playerId)) };
    }
    const acknowledgement = Object.values(aggregate.outcomes[connection.playerId] ?? {}).sort((a, b) => a.ack.version - b.ack.version).at(-1)?.ack ?? null;
    return { version: aggregate.version, acknowledgement: clone(acknowledgement), room: clone(aggregate.room), selfId: connection.playerId, game: projected, notice: aggregate.notice };
  }

  private applyIntent(aggregate: Aggregate, connection: Connection, intent: Intent): Acknowledgement {
    const command = intent.command, host = aggregate.room.hostId === connection.playerId;
    if (command.type === 'configure') {
      if (!host) return { actionId: intent.actionId, accepted: false, code: 'room.hostOnly', version: aggregate.version };
      if (aggregate.room.status !== 'lobby') return { actionId: intent.actionId, accepted: false, code: 'room.inProgress', version: aggregate.version };
      if (command.setup === null) aggregate.room.setup = null;
      else {
        const entry = Object.hasOwn(this.deps.games, command.setup.gameId) ? this.deps.games[command.setup.gameId] : undefined;
        const settings = entry?.parseSettings(command.setup.settings);
        if (!entry || settings === null || settings === undefined) return { actionId: intent.actionId, accepted: false, code: 'game.invalid', version: aggregate.version };
        aggregate.room.setup = { gameId: entry.manifest.id, settings };
      }
      this.mutate(); return { actionId: intent.actionId, accepted: true, code: 'ok', version: aggregate.version };
    }
    if (command.type === 'profile') {
      if (aggregate.room.status !== 'lobby') return { actionId: intent.actionId, accepted: false, code: 'room.inProgress', version: aggregate.version };
      const player = this.player(connection.playerId)!;
      const profile = { ...command.profile, tile: player.tile };
      if (!validProfile(profile)) return { actionId: intent.actionId, accepted: false, code: 'join.invalid', version: aggregate.version };
      player.name = profile.name.trim(); player.faceId = profile.faceId;
      this.mutate(); return { actionId: intent.actionId, accepted: true, code: 'ok', version: aggregate.version };
    }
    if ((command.type === 'start' || command.type === 'abort' || command.type === 'lobby' || command.type === 'close' || command.type === 'kick') && !host) return { actionId: intent.actionId, accepted: false, code: 'room.hostOnly', version: aggregate.version };
    if (command.type === 'start') {
      if (aggregate.room.status !== 'lobby' || aggregate.game) return { actionId: intent.actionId, accepted: false, code: 'game.notStartable', version: aggregate.version };
      const entry = Object.hasOwn(this.deps.games, command.gameId) ? this.deps.games[command.gameId] : undefined;
      if (!entry) return { actionId: intent.actionId, accepted: false, code: 'game.invalid', version: aggregate.version };
      const settings = entry.parseSettings(command.settings);
      if (settings === null) return { actionId: intent.actionId, accepted: false, code: 'game.invalid', version: aggregate.version };
      const players = aggregate.room.players.filter(player => !player.departed && player.connected);
      if (players.length < entry.manifest.minPlayers || players.length > entry.manifest.maxPlayers) return { actionId: intent.actionId, accepted: false, code: 'game.playerCount', version: aggregate.version };
      if (players.some(player => !aggregate.memberships[player.id]?.ready)) return { actionId: intent.actionId, accepted: false, code: 'game.notReady', version: aggregate.version };
      const seed = this.deps.seed(), state = entry.init({ players: clone(players), settings, seed, now: this.deps.now(), rng: rng(seed, 0), hostId: aggregate.room.hostId }); const phase = entry.phase(state);
      aggregate.game = { id: this.deps.id(), gameId: command.gameId, roster: players.map(player => player.id), phaseEpoch: 1, phaseToken: phase.token, state, seed, transition: 1, status: 'active', result: null };
      aggregate.room.gamesStarted = (aggregate.room.gamesStarted ?? aggregate.room.gamesPlayed) + 1;
      aggregate.room.status = 'playing'; aggregate.room.gameId = command.gameId; aggregate.notice = null; this.updateInsufficient(); this.mutate();
      return { actionId: intent.actionId, accepted: true, code: 'ok', version: aggregate.version };
    }
    if (command.type === 'action') {
      const game = aggregate.game; if (!game || game.status !== 'active' || !game.roster.includes(connection.playerId)) return { actionId: intent.actionId, accepted: false, code: 'game.unavailable', version: aggregate.version };
      const entry = this.deps.games[game.gameId]!, phase = entry.phase(game.state);
      if (command.scope.gameInstanceId !== game.id || command.scope.phaseEpoch !== game.phaseEpoch || command.scope.roundId !== phase.roundId) return { actionId: intent.actionId, accepted: false, code: 'game.staleScope', version: aggregate.version };
      const parsed = entry.parseAction(command.payload); if (parsed === null) return { actionId: intent.actionId, accepted: false, code: 'action.invalid', version: aggregate.version };
      const reduced = entry.reduce(game.state, parsed, { actor: connection.playerId, hostId: aggregate.room.hostId, now: this.deps.now(), rng: rng(game.seed, game.transition) });
      if (!reduced.accepted) return { actionId: intent.actionId, accepted: false, code: reduced.code, version: aggregate.version };
      const token = phase.token; game.state = reduced.state; game.transition += 1; const next = entry.phase(game.state); if (next.token !== token) game.phaseEpoch += 1; game.phaseToken = next.token; this.finishIfNeeded(aggregate, entry); this.mutate();
      return { actionId: intent.actionId, accepted: true, code: 'ok', version: aggregate.version };
    }
    if (command.type === 'abort') { if (aggregate.game?.status !== 'active') return { actionId: intent.actionId, accepted: false, code: 'game.notActive', version: aggregate.version }; this.abort(aggregate, 'game.aborted'); this.mutate(); return { actionId: intent.actionId, accepted: true, code: 'ok', version: aggregate.version }; }
    if (command.type === 'lobby') { if (aggregate.game?.status !== 'completed') return { actionId: intent.actionId, accepted: false, code: 'game.notCompleted', version: aggregate.version }; if (command.destination === 'catalogue') aggregate.room.setup = null; aggregate.game = null; aggregate.room.status = 'lobby'; aggregate.room.gameId = null; aggregate.notice = null; this.mutate(); return { actionId: intent.actionId, accepted: true, code: 'ok', version: aggregate.version }; }
    if (command.type === 'leave') { this.depart(aggregate, connection.playerId); this.mutate(); return { actionId: intent.actionId, accepted: true, code: 'ok', version: aggregate.version }; }
    if (command.type === 'kick') { const target = Object.hasOwn(aggregate.memberships, command.playerId) ? aggregate.memberships[command.playerId] : undefined; if (command.playerId === aggregate.room.hostId || !target || target.revoked) return { actionId: intent.actionId, accepted: false, code: 'room.cannotKick', version: aggregate.version }; this.depart(aggregate, command.playerId); this.mutate(); return { actionId: intent.actionId, accepted: true, code: 'ok', version: aggregate.version }; }
    aggregate.room.status = 'closed'; aggregate.room.gameId = null; aggregate.game = null; aggregate.hostDeadline = null; aggregate.insufficientDeadline = null; aggregate.notice = 'room.closed'; this.mutate(); return { actionId: intent.actionId, accepted: true, code: 'ok', version: aggregate.version };
  }

  private finishIfNeeded(aggregate: Aggregate, entry: GameEntry): void {
    const game = aggregate.game; if (!game || game.status !== 'active' || !entry.isFinished(game.state)) return;
    const scores = entry.scores(game.state), keys = Object.keys(scores).sort(), roster = [...game.roster].sort(), n = roster.length;
    if (keys.length !== roster.length || keys.some((key, index) => key !== roster[index]) || Object.values(scores).some(value => !Number.isInteger(value) || value < 0 || value > n)) throw new Error('Invalid game awards');
    game.result = { public: entry.publicView(game.state, this.rosterPlayers(game.roster)), private: Object.fromEntries(game.roster.map(id => [id, entry.privateView(game.state, id)])), phase: entry.phase(game.state) };
    game.status = 'completed'; setOwn(aggregate.awards, game.id, clone(scores)); for (const id of game.roster) setOwn(aggregate.room.totals, id, (Object.hasOwn(aggregate.room.totals, id) ? aggregate.room.totals[id]! : 0) + scores[id]!);
    aggregate.room.gamesPlayed += 1; aggregate.room.status = 'completed'; aggregate.insufficientDeadline = null;
  }
  private abort(aggregate: Aggregate, notice: string): void { aggregate.game = null; aggregate.room.status = 'lobby'; aggregate.room.gameId = null; aggregate.insufficientDeadline = null; aggregate.notice = notice; }
  private depart(aggregate: Aggregate, id: PlayerId): void { const member = Object.hasOwn(aggregate.memberships, id) ? aggregate.memberships[id] : undefined; if (!member) throw new Error('Missing membership'); member.revoked = true; member.ready = false; const player = this.player(id)!; player.connected = false; player.departed = true; player.lastSeenAt = this.deps.now(); aggregate.lastActivity = this.deps.now(); if (aggregate.room.hostId === id) { aggregate.room.hostId = null; aggregate.hostDeadline = null; aggregate.room.hostId = this.electHost(); } this.updateInsufficient(); }
  private ack(aggregate: Aggregate, playerId: string, actionId: string, accepted: boolean, code: string, fingerprint: string | null): Acknowledgement { const ack = { actionId, accepted, code, version: aggregate.version }; if (fingerprint !== null) { const ledger = aggregate.outcomes[playerId]; if (!ledger) throw new Error('Missing outcome ledger'); setOwn(ledger, actionId, { fingerprint, ack }); this.mutate(); ack.version = aggregate.version; ledger[actionId]!.ack.version = aggregate.version; } return ack; }
  private auth(connection: Connection): Aggregate | null { const aggregate = this.aggregate(), membership = aggregate && Object.hasOwn(aggregate.memberships, connection.playerId) ? aggregate.memberships[connection.playerId] : undefined, player = aggregate?.room.players.find(item => item.id === connection.playerId); return aggregate && membership && player?.connected && !membership.revoked && membership.generation === connection.generation ? aggregate : null; }
  private aggregate(): Aggregate | null { return this.current?.kind === 'room' ? this.current.value : null; }
  private player(id: string): Player | undefined { return this.aggregate()?.room.players.find(player => player.id === id); }
  private rosterPlayers(ids: string[]): Player[] { return ids.map(id => this.player(id)).filter((player): player is Player => player !== undefined); }
  private touchInternal(id: string): void { const aggregate = this.aggregate()!; const player = this.player(id)!; player.lastSeenAt = this.deps.now(); aggregate.lastActivity = this.deps.now(); }
  private electHost(): PlayerId | null { const aggregate = this.aggregate(); if (!aggregate) return null; const roster = aggregate.game?.roster; return aggregate.room.players.filter(player => !player.departed && player.connected && (!roster || roster.includes(player.id))).sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))[0]?.id ?? null; }
  private updateInsufficient(): void { const aggregate = this.aggregate(); if (!aggregate || aggregate.game?.status !== 'active') { if (aggregate) aggregate.insufficientDeadline = null; return; } const entry = Object.hasOwn(this.deps.games, aggregate.game.gameId) ? this.deps.games[aggregate.game.gameId] : undefined; const connected = aggregate.game.roster.filter(id => this.player(id)?.connected).length; aggregate.insufficientDeadline = entry && connected < entry.manifest.minPlayers ? aggregate.insufficientDeadline ?? this.deps.now() + 60_000 : null; }
  private mutate(): void { const aggregate = this.aggregate(); if (aggregate) { aggregate.version += 1; this.changed = true; this.schedule(); } }
  private schedule(): void { const aggregate = this.aggregate(); if (!aggregate) return; const times: number[] = [Math.max(aggregate.room.createdAt + 8 * 60 * 60_000, aggregate.lastActivity + 60 * 60_000)]; if (aggregate.hostDeadline !== null) times.push(aggregate.hostDeadline); if (aggregate.insufficientDeadline !== null) times.push(aggregate.insufficientDeadline); if (aggregate.game?.status === 'active') { const entry = Object.hasOwn(this.deps.games, aggregate.game.gameId) ? this.deps.games[aggregate.game.gameId] : undefined; const deadline = entry?.phase(aggregate.game.state).endsAt; if (deadline !== null && deadline !== undefined) times.push(deadline); } aggregate.alarm = { at: Math.min(...times), gameInstanceId: aggregate.game?.id ?? null, phaseEpoch: aggregate.game?.phaseEpoch ?? null }; }
}
