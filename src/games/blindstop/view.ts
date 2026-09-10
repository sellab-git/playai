import { bindIntentionalClick } from '../../client/activation.ts';
import type { Json } from '../../engine.ts';
import { t } from '../../client/i18n.ts';
import type { GameViewProps } from '../../client/views.ts';
import { escapeHtml, avatar, tick, ring, button, playerIdentity } from '../../client/presentation.ts';

interface Row { playerId: string; elapsedMs: number | null; errorMs: number | null; rank: number; award: number; }
interface Standing { playerId: string; completed: number; missed: number; meanErrorMs: number | null; rank: number; award: number; }
interface History { round: number; targetMs: number; rows: Row[]; }
interface Projection {
  targetMs: number; startAt: number; endsAt: number;
  phase: 'countdown' | 'round' | 'result' | 'final';
  submitted: number; submittedIds: string[]; total: number; rows: Row[];
  rounds: number; round: number; practice: boolean; pace: 'manual' | 'auto';
  paused: boolean; nextAt: number | null; standings: Standing[]; history: History[];
}
const object = (value: Json | undefined): Record<string, Json> | null => value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
const number = (value: Json | undefined): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
function readRows(value: Json | undefined): Row[] | null {
  if (!Array.isArray(value)) return null;
  const rows: Row[] = [];
  for (const item of value) {
    const row = object(item); if (!row || typeof row.playerId !== 'string') return null;
    const rank = number(row.rank), award = number(row.award);
    if (rank === null || award === null) return null;
    rows.push({ playerId: row.playerId, elapsedMs: number(row.elapsedMs), errorMs: number(row.errorMs), rank, award });
  }
  return rows;
}
function projection(value: Json): Projection | null {
  const raw = object(value); if (!raw) return null;
  const phase = raw.phase, targetMs = number(raw.targetMs), startAt = number(raw.startAt), endsAt = number(raw.endsAt);
  const rows = readRows(raw.rows);
  if (!['countdown', 'round', 'result', 'final'].includes(String(phase)) || targetMs === null || startAt === null || endsAt === null || !rows) return null;
  if (!Array.isArray(raw.submittedIds) || !raw.submittedIds.every(id => typeof id === 'string') || !Array.isArray(raw.standings) || !Array.isArray(raw.history)) {
    if (raw.rounds === undefined && phase === 'result') return { targetMs,startAt,endsAt,phase:'final',rows,submitted:number(raw.submitted)??0,total:number(raw.total)??rows.length,rounds:1,round:1,practice:false,pace:'manual',paused:false,nextAt:null,submittedIds:rows.filter(row=>row.errorMs!==null).map(row=>row.playerId),standings:rows.map(row=>({playerId:row.playerId,completed:row.errorMs===null?0:1,missed:row.errorMs===null?1:0,meanErrorMs:row.errorMs===null?null:Math.abs(row.errorMs),rank:row.rank,award:row.award})),history:[{round:1,targetMs,rows}] };
    return null;
  }
  const standings: Standing[] = [];
  for (const value of raw.standings) {
    const row = object(value); if (!row || typeof row.playerId !== 'string') return null;
    const completed = number(row.completed), missed = number(row.missed), rank = number(row.rank), award = number(row.award);
    if (completed === null || missed === null || rank === null || award === null) return null;
    standings.push({ playerId: row.playerId, completed, missed, meanErrorMs: number(row.meanErrorMs), rank, award });
  }
  const history: History[] = [];
  for (const value of raw.history) {
    const entry = object(value); if (!entry) return null;
    const round = number(entry.round), targetMs = number(entry.targetMs), rows = readRows(entry.rows);
    if (round === null || targetMs === null || !rows) return null;
    history.push({ round, targetMs, rows });
  }
  if (phase !== 'countdown' && phase !== 'round' && phase !== 'result' && phase !== 'final') return null;
  return { targetMs, startAt, endsAt, phase, rows, standings, history, submittedIds: raw.submittedIds,
    submitted: number(raw.submitted) ?? 0, total: number(raw.total) ?? 0, rounds: number(raw.rounds) ?? 1,
    round: number(raw.round) ?? 1, practice: raw.practice === true, pace: raw.pace === 'auto' ? 'auto' : 'manual',
    paused: raw.paused === true, nextAt: number(raw.nextAt) };
}
const privateSubmitted = (value: Json): boolean => object(value)?.submitted === true;
const time = (milliseconds: number): string => t('time.seconds', { value: (milliseconds / 1000).toFixed(2) });
const localStarts = new Map<string, number>();

function roster(props: GameViewProps, state: Projection, mode: 'waiting' | 'round' | 'overall' | 'final'): string {
  const waiting = mode === 'waiting', cumulative = mode === 'overall' || mode === 'final';
  const ids = waiting ? props.players.filter(player => !player.departed).map(player => player.id) : (cumulative ? state.standings : state.rows).map(row => row.playerId);
  const rows = ids.flatMap(id => {
    const player = props.players.find(candidate => candidate.id === id); if (!player) return [];
    const row = state.rows.find(candidate => candidate.playerId === id), standing = state.standings.find(candidate => candidate.playerId === id);
    const saved = state.submittedIds.includes(id);
    const value = waiting ? (saved ? tick() : t('blindstop.counting')) : cumulative ? standing?.meanErrorMs == null ? t('blindstop.emptyValue') : time(standing.meanErrorMs) : row?.errorMs == null ? t('blindstop.missed') : time(Math.abs(row.errorMs));
    const place = cumulative ? standing?.rank : row?.rank;
    const position = waiting ? '' : mode === 'final' ? t('blindstop.award', { count: standing?.award ?? 0 }) : place === undefined ? t('blindstop.emptyValue') : t('blindstop.rank', { rank: place });
    let identity = playerIdentity(player, props.selfId, props.hostId);
    const annotations = [mode === 'final' && place !== undefined ? t('blindstop.rank', { rank: place }) : '', cumulative && standing && standing.missed > 0 ? t('blindstop.completedTaps', { count: standing.completed, total: standing.completed + standing.missed }) : ''].filter(Boolean).join(' · ');
    if (annotations) identity = identity.replace('<div class="role">', `<div class="role">${annotations} · `);
    return [`<div class="player ${id === props.selfId ? 'self' : ''} ${player.departed ? 'absent' : ''} ${mode === 'final' && place === 1 && (standing?.completed ?? 0) > 0 ? 'top-ranked' : ''}">${avatar(player)}${identity}<div class="value ${waiting && !saved ? 'quiet' : ''}" ${waiting ? `aria-label="${t(saved ? 'blindstop.saved' : 'blindstop.counting')}"` : ''}>${value}</div><div class="position">${position}</div></div>`];
  }).join('');
  return `<div class="roster"><div class="table-head"><span class="people-label">${t('blindstop.playersHeading', { count: ids.length })}</span><span class="value">${waiting ? t('blindstop.statusHeading') : t(cumulative ? 'blindstop.averageHeading' : 'blindstop.errorHeading')}</span><span class="position">${waiting ? '' : t(mode === 'final' ? 'blindstop.pointsHeading' : 'blindstop.placeHeading')}</span></div><div class="roster-scroll" tabindex="0" role="region" aria-label="${t('blindstop.playersLabel')}">${rows}</div></div>`;
}
function winners(props: GameViewProps, state: Projection, final: boolean): string {
  const valid = final ? state.standings.filter(row => row.completed > 0) : state.rows.filter(row => row.errorMs !== null);
  const best = Math.min(...valid.map(row => row.rank)), leaders = valid.filter(row => row.rank === best);
  if (!leaders.length) return t('blindstop.noWinner');
  return leaders.length > 1 ? t(final ? 'blindstop.finalTie' : 'blindstop.roundTie', { count: leaders.length }) : t(final ? 'blindstop.winner' : 'blindstop.roundWinner', { name: escapeHtml(props.playerName(leaders[0]!.playerId)) });
}
function footer(props: GameViewProps, meta: string, primary: string, secondary = ''): void {
  props.footerRoot.innerHTML = `<p class="action-meta">${meta}</p>${primary}<div class="secondary-slot">${secondary}</div>`;
}
function send(props: GameViewProps, type: 'NEXT' | 'START' | 'PAUSE' | 'RESUME'): void {
  if (props.isHost && props.canAct) props.actions.send({ type: 'action', scope: props.scope, payload: { type } });
}
function details(items: Array<[string, string]>): string {
  return `<dl class="detail-list">${items.map(([key, value]) => `<dt>${t(key)}</dt><dd>${value}</dd>`).join('')}</dl>`;
}
function registerMenu(props: GameViewProps, state: Projection): void {
  const own = state.rows.find(row => row.playerId === props.selfId), standing = state.standings.find(row => row.playerId === props.selfId);
  let pauseRequested = false;
  const pause = (): void => { if (!pauseRequested && props.canAct && state.phase === 'result' && state.pace === 'auto' && !state.practice && !state.paused) { pauseRequested = true; send(props, 'PAUSE'); } };
  const actions: Array<{ label: string; run: () => void }> = [];
  if (state.phase === 'result') {
    actions.push({ label: t('blindstop.roundDetails'), run: () => {
      pause(); props.openDialog(t('blindstop.roundDetails'), details([
        ['blindstop.targetValue', time(state.targetMs)], ['blindstop.tapValue', own?.elapsedMs == null ? t('blindstop.emptyValue') : time(own.elapsedMs)],
        ['blindstop.errorValue', own?.errorMs == null ? t('blindstop.missed') : time(Math.abs(own.errorMs))],
        ['blindstop.placeHeading', own ? t('blindstop.place', { rank: own.rank, total: state.total }) : t('blindstop.emptyValue')],
      ]));
    } });
    if (!state.practice) actions.push({ label: t('blindstop.overallResults'), run: () => { pause(); props.openDialog(t('blindstop.overallResults'), roster(props, state, 'overall')); } });
  }
  if (state.phase === 'final') actions.push({ label: t('blindstop.yourStats'), run: () => {
    const errors = state.history.flatMap(entry => { const row = entry.rows.find(row => row.playerId === props.selfId); return row?.errorMs == null ? [] : [Math.abs(row.errorMs)]; });
    props.openDialog(t('blindstop.yourStats'), details([
      ['blindstop.completedValue', t('blindstop.completedCount', { count: standing?.completed ?? 0, total: state.rounds })],
      ['blindstop.averageHeading', standing?.meanErrorMs == null ? t('blindstop.emptyValue') : time(standing.meanErrorMs)],
      ['blindstop.bestValue', errors.length ? time(Math.min(...errors)) : t('blindstop.emptyValue')],
      ['blindstop.placeHeading', standing ? t('blindstop.rank', { rank: standing.rank }) : t('blindstop.emptyValue')],
    ]));
  } });
  props.registerMenu(actions, pause);
}

export function renderBlindstop(props: GameViewProps): void {
  const state = projection(props.publicView);
  if (!state) { props.root.innerHTML = `<p class="game-error">${t('error.generic')}</p>`; return; }
  if (props.completed && state.phase === 'result') state.phase = 'final';
  const focusedAction = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.action : undefined;
  const scrollTop = props.root.querySelector('.roster-scroll')?.scrollTop ?? 0;
  const rosterFocused = document.activeElement === props.root.querySelector('.roster-scroll');
  const submitted = privateSubmitted(props.privateView) || state.submittedIds.includes(props.selfId);
  const roundKey = `${props.scope.gameInstanceId}:${props.scope.roundId}`;
  registerMenu(props, state);
  props.setTitle(t(state.practice ? 'blindstop.practiceRound' : state.phase === 'final' ? 'blindstop.finalTitle' : state.phase === 'result' ? 'blindstop.resultTitle' : 'blindstop.roundTitle', { round: state.round, total: state.rounds }));
  if ((state.phase === 'countdown' || state.phase === 'round') && props.canAct && !localStarts.has(roundKey)) localStarts.set(roundKey, props.localTime(state.startAt));
  if (state.phase === 'countdown' || (state.phase === 'round' && !submitted)) {
    const counting = state.phase === 'countdown';
    const remaining = Math.min(3, Math.max(1, Math.ceil((state.startAt - props.now) / 1000)));
    props.announce(counting ? t('blindstop.accessibleCountdown', { count: remaining }) : t('blindstop.countNow'));
    props.root.innerHTML = `<section class="timing"><div class="timing-content"><p class="meta">${t('blindstop.targetLabel')}</p><p class="target-number">${(state.targetMs / 1000).toFixed(2)} <small>${t('blindstop.unit')}</small></p><div class="count-holder ${counting ? '' : 'silent'}" aria-hidden="true">${ring()}<span class="count-digit">${remaining}</span></div><p class="meta ${counting ? '' : 'silent'}">${t('blindstop.countStarts')}</p></div></section>`;
    footer(props, counting ? '' : t('blindstop.countSilently'), button(counting ? 'blindstop.getReady' : 'blindstop.tap', 'tap', 'primary tap', counting || !props.canAct));
    if (!counting) {
      const tap = props.footerRoot.querySelector<HTMLButtonElement>('[data-action="tap"]');
      const localStart = localStarts.get(roundKey) ?? props.localTime(state.startAt);
      let sent = false;
      const sendTap = (): void => {
        if (sent || !props.canAct || !tap || tap.disabled) return;
        sent = true; tap.disabled = true;
        props.actions.send({ type: 'action', scope: props.scope, payload: { type: 'TAP', elapsedMs: Math.max(0, performance.now() - localStart) } });
      };
      tap?.addEventListener('pointerdown', event => { if (!event.isPrimary || event.button !== 0) return; event.preventDefault(); sendTap(); });
      tap?.addEventListener('click', sendTap);
      tap?.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) { event.preventDefault(); sendTap(); } });
    }
  } else if (state.phase === 'round') {
    props.announce(t('blindstop.saved'));
    props.root.innerHTML = `<section class="game-layout"><div class="focal"><div class="locked-mark">${tick()}</div><h2>${t('blindstop.saved')}</h2><p class="message">${t(state.total - state.submitted === 1 ? 'blindstop.waitingLast' : state.total === state.submitted ? 'blindstop.waitingNone' : 'blindstop.waitingMore', { count: state.total - state.submitted })}</p></div>${roster(props, state, 'waiting')}</section>`;
    footer(props, t('blindstop.hidden'), `<div class="action-placeholder primary-slot">${t('blindstop.recorded')}</div>`);
  } else {
    localStarts.delete(roundKey);
    const final = state.phase === 'final', own = state.rows.find(row => row.playerId === props.selfId), standing = state.standings.find(row => row.playerId === props.selfId), error = own?.errorMs ?? null;
    const measurement = error === null ? `<h2>${t('blindstop.missed')}</h2>` : `<p class="number">${(Math.abs(error) / 1000).toFixed(2)} <small>${t('blindstop.unit')}${error === 0 ? '' : ` ${t(error < 0 ? 'blindstop.earlyLabel' : 'blindstop.lateLabel')}`}</small></p>`;
    const focal = final ? `<h2><span class="highlight highlight-green">${winners(props, state, true)}</span></h2><p class="message">${standing?.meanErrorMs == null ? t('blindstop.noAverage') : t('blindstop.yourAverage', { time: time(standing.meanErrorMs) })}</p>` : `<p class="meta">${t('blindstop.yourTiming')}</p>${measurement}<p class="message">${winners(props, state, false)}</p>`;
    props.root.innerHTML = `<section class="game-layout"><div class="focal">${focal}</div>${roster(props, state, final ? 'final' : 'round')}</section>`;
    const place = final ? standing && standing.completed > 0 ? t('blindstop.yourPlace', { rank: standing.rank }) : t('blindstop.noPoints') : own ? t('blindstop.place', { rank: own.rank, total: state.total }) : '';
    const auto = !final && state.pace === 'auto' && !state.practice;
    const remaining = state.nextAt === null ? 8 : Math.max(0, Math.ceil((state.nextAt - props.now) / 1000));
    const meta = final ? place : state.practice ? t('blindstop.noPracticePoints') : auto ? t(state.paused ? 'blindstop.autoPaused' : state.round === state.rounds ? 'blindstop.autoFinal' : 'blindstop.autoNext', { count: remaining }) : place;
    if (!props.isHost) footer(props, meta, `<div class="action-placeholder primary-slot">${t('blindstop.hostDecision', { name: escapeHtml(props.playerName(props.hostId ?? '')) })}</div>`);
    else if (final) {
      footer(props, meta, button('blindstop.again', 'again', 'primary', !props.canAct), button('blindstop.anotherGame', 'another-game', 'secondary', !props.canAct));
      props.footerRoot.querySelector('[data-action="again"]')?.addEventListener('click', props.returnToRoom);
      props.footerRoot.querySelector('[data-action="another-game"]')?.addEventListener('click', props.chooseGame);
    } else {
      footer(props, meta, button(state.practice ? 'blindstop.startGame' : state.round === state.rounds ? 'blindstop.seeFinal' : 'blindstop.nextRound', 'next', 'primary', !props.canAct), auto ? button(state.paused ? 'blindstop.resumeAuto' : 'blindstop.pauseAuto', 'toggle-auto', 'secondary', !props.canAct) : '');
      const next = props.footerRoot.querySelector('[data-action="next"]');
      if (next) bindIntentionalClick(next, `${roundKey}:${state.phase}`, () => send(props, state.practice ? 'START' : 'NEXT'));
      props.footerRoot.querySelector('[data-action="toggle-auto"]')?.addEventListener('click', () => send(props, state.paused ? 'RESUME' : 'PAUSE'));
    }
  }
  const scroll = props.root.querySelector<HTMLElement>('.roster-scroll');
  if (scroll) { scroll.scrollTop = scrollTop; if (rosterFocused) scroll.focus({ preventScroll: true }); }
  if (focusedAction) Array.from(props.footerRoot.querySelectorAll<HTMLButtonElement>('button[data-action]')).find(node => node.dataset.action === focusedAction)?.focus({ preventScroll: true });
}

export default renderBlindstop;

export { preparation } from './setup.ts';
