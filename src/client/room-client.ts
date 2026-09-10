import { z } from 'zod';
import type { Acknowledgement, Command, Intent } from '../engine';
import { ClockEstimator } from './clock';
import { CommandBuffer } from './command-buffer';
import { newerSnapshot, parseMessage, pendingOutcome } from './protocol';
import { parseIntent } from '../room/validation';
import type { UiModel, UiActions } from './model';

function freeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
}

export function createRoomClient() {
  let started = false;
  let generation = 0;
  const requests = new Set<AbortController>();
  const listeners = new Set<() => void>();
  const clock = new ClockEstimator();
  const savedSchema = z.object({
    code: z.string().regex(/^[A-HJ-NP-Z2-9]{5}$/),
    credential: z.string().regex(/^[a-f0-9]{64}$/),
  });
  type Saved = z.infer<typeof savedSchema>;
  const storageKey = 'playai.membership';
  let saved: Saved | null = null;
  let socket: WebSocket | null = null;
  let pending: Intent | null = null;
  let pendingSettings = false;
  const commands = new CommandBuffer();
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let pendingTimer: ReturnType<typeof setTimeout> | null = null;
  let active = false;
  let retrySent = false;
  const pings = new Set<number>();
  const model: UiModel = {
    snapshot: null,
    connected: false,
    calibrated: false,
    pending: false,
    admissionPending: false,
    persistenceWarning: null,
    error: null,
    delivery: null,
    savedRoomCode: null,
    now: 0,
    serverToLocal: (time) => clock.localTime(time),
  };
  let published: UiModel = Object.freeze({
    ...model,
    serverToLocal: (time: number) => time,
  });
  function paint(): void {
    if (!started) return;
    model.now = performance.now() + clock.offset;
    const offset = clock.offset;
    published = freeze({ ...model, serverToLocal: (time: number) => time - offset });
    for (const listener of listeners) listener();
  }
  /** Storage is optional for current-tab delivery, but recovery must never be promised after failure. */
  function storageRead(
    kind: 'localStorage' | 'sessionStorage',
    key: string,
  ): string | null {
    try {
      return window[kind].getItem(key);
    } catch {
      model.persistenceWarning = 'storage.unavailable';
      return null;
    }
  }
  function storageWrite(
    kind: 'localStorage' | 'sessionStorage',
    key: string,
    value: string | null,
  ): void {
    try {
      if (value === null) window[kind].removeItem(key);
      else window[kind].setItem(key, value);
    } catch {
      model.persistenceWarning = 'storage.unavailable';
    }
  }
  function storeMembership(): void {
    storageWrite('localStorage', storageKey, saved ? JSON.stringify(saved) : null);
  }
  function settingsEdit(command: Command): boolean {
    const snapshot = model.snapshot;
    return (
      command.type === 'configure' &&
      !!command.setup &&
      snapshot?.room.status === 'lobby' &&
      snapshot.room.hostId === snapshot.selfId &&
      snapshot.room.setup?.gameId === command.setup.gameId
    );
  }
  function persistPending(): void {
    storageWrite(
      'sessionStorage',
      'playai.pending',
      pending
        ? JSON.stringify({
            code: saved?.code,
            intent: pending,
            settingsEdit: pendingSettings,
            queued: commands.queuedCommands(),
          })
        : null,
    );
  }
  function updatePending(): void {
    model.pending = (!!pending && !pendingSettings) || commands.hasBarrier;
  }
  function cancelQueued(): void {
    commands.clear();
    model.settingsDraft = null;
    updatePending();
    persistPending();
  }
  function clearPending(): void {
    pending = null;
    pendingSettings = false;
    model.pending = false;
    retrySent = false;
    commands.clear();
    model.settingsDraft = null;
    persistPending();
    if (pendingTimer) clearTimeout(pendingTimer);
  }
  function beginCommand(command: Command, background: boolean): void {
    pending = { actionId: crypto.randomUUID(), command };
    pendingSettings = background;
    retrySent = false;
    updatePending();
    model.delivery = background ? null : 'delivery.sending';
    model.error = null;
    persistPending();
    transmitPending();
  }
  function settleDraft(): void {
    if (
      !model.settingsDraft ||
      pendingSettings ||
      commands.queuedCommands().some((command) => command.type === 'configure')
    )
      return;
    if (
      JSON.stringify(model.snapshot?.room.setup) === JSON.stringify(model.settingsDraft)
    )
      model.settingsDraft = null;
  }
  function acceptOutcome(outcome: Acknowledgement | null): void {
    const confirmed = pendingOutcome(pending, outcome);
    if (!confirmed || !pending) return;
    const command = pending.command,
      background = pendingSettings;
    pending = null;
    pendingSettings = false;
    retrySent = false;
    if (pendingTimer) clearTimeout(pendingTimer);
    model.delivery = confirmed.accepted && !background ? 'delivery.saved' : null;
    model.error = confirmed.accepted ? null : confirmed.code;
    if (!confirmed.accepted) cancelQueued();
    if (confirmed.accepted && command.type === 'leave') {
      fresh();
      return;
    }
    const next = confirmed.accepted ? commands.takeNext() : null;
    if (next) beginCommand(next, settingsEdit(next));
    else {
      updatePending();
      persistPending();
      settleDraft();
    }
  }
  function sendWire(value: unknown): void {
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(value));
  }
  function ping(): void {
    const t0 = performance.now();
    pings.add(t0);
    if (pings.size > 10) pings.delete(pings.values().next().value!);
    sendWire({ type: 'ping', t0 });
  }
  function transmitPending(): void {
    if (!pending || !model.connected || !clock.ready) return;
    retrySent = true;
    sendWire({ type: 'intent', intent: pending });
    if (pendingTimer) clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => {
      if (pending) {
        model.delivery = 'delivery.unknown';
        socket?.close();
        paint();
      }
    }, 5000);
  }
  function connect(): void {
    if (!started || !saved || !active) return;
    clock.reset();
    pings.clear();
    model.calibrated = false;
    model.connected = false;
    retrySent = false;
    const url = new URL(`/api/rooms/${saved.code}/socket`, location.href);
    url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(url);
    socket = ws;
    ws.addEventListener('open', () => {
      if (socket === ws) sendWire({ type: 'auth', credential: saved?.credential });
    });
    ws.addEventListener('message', (event) => {
      if (socket !== ws || typeof event.data !== 'string') return;
      const message = parseMessage(event.data);
      if (!message) {
        model.error = 'request.invalid';
        paint();
        return;
      }
      if (message.type === 'state') {
        const old = model.snapshot;
        model.snapshot = newerSnapshot(old, message.snapshot);
        model.connected = true;
        model.admissionPending = false;
        if (
          model.settingsDraft &&
          (model.snapshot.room.status !== 'lobby' ||
            model.snapshot.room.hostId !== model.snapshot.selfId ||
            model.snapshot.room.setup?.gameId !== model.settingsDraft.gameId)
        )
          cancelQueued();
        acceptOutcome(model.snapshot.acknowledgement);
        settleDraft();
        if (!clock.ready && pings.size === 0) ping();
        if (!pingTimer) pingTimer = setInterval(ping, 30000);
        if (model.snapshot.room.hostId !== old?.room.hostId && old)
          model.delivery = 'room.hostChanged';
        if (model.snapshot.notice) model.error = model.snapshot.notice;
        if (model.snapshot.room.status === 'closed') {
          active = false;
          saved = null;
          storeMembership();
          clearPending();
        }
      } else if (message.type === 'clock') {
        if (!pings.delete(message.t0)) return;
        if (clock.sample(message.t0, performance.now(), message.serverNow)) {
          model.calibrated = true;
          sendWire({ type: 'ready', ready: !document.hidden });
          if (pending && !retrySent) transmitPending();
        }
      } else if (message.type === 'ack') {
        acceptOutcome(message.ack);
      } else {
        model.error = message.code;
        if (
          [
            'session.ended',
            'session.invalid',
            'room.closed',
            'auth.invalid',
            'auth.staleConnection',
            'session.revoked',
            'session.replaced',
          ].includes(message.code)
        ) {
          active = false;
          model.connected = false;
          model.admissionPending = false;
          model.snapshot = null;
          model.savedRoomCode = null;
          saved = null;
          storeMembership();
          clearPending();
          ws.close();
        }
      }
      paint();
    });
    ws.addEventListener('close', () => {
      if (socket !== ws) return;
      model.connected = false;
      model.calibrated = false;
      if (pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }
      if (pending) model.delivery = 'delivery.unknown';
      if (!model.snapshot) {
        // A failed initial connection must return control to recovery, not trap the entry form.
        active = false;
        model.admissionPending = false;
        model.error = 'delivery.failed';
      }
      if (active) reconnectTimer = setTimeout(connect, 1200);
      paint();
    });
  }
  function fresh(): void {
    if (!started) return;
    generation++;
    for (const request of requests) request.abort();
    requests.clear();
    active = false;
    model.admissionPending = false;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    const previous = socket;
    socket = null;
    previous?.close();
    saved = null;
    storeMembership();
    clearPending();
    model.snapshot = null;
    model.savedRoomCode = null;
    model.connected = false;
    model.calibrated = false;
    model.error = null;
    model.delivery = null;
    paint();
  }
  async function admit(path: string, name: string, faceId: string): Promise<void> {
    if (!started || model.admissionPending) return;
    const token = ++generation;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    requests.add(controller);
    model.admissionPending = true;
    model.error = null;
    paint();
    try {
      let deviceId = storageRead('localStorage', 'playai.device');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        storageWrite('localStorage', 'playai.device', deviceId);
      }
      const response = await fetch(path, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, faceId, deviceId }),
      });
      const raw: unknown = await response.json();
      if (!started || token !== generation) return;
      const parsed = savedSchema.safeParse(raw);
      if (!response.ok || !parsed.success) {
        model.error =
          z.object({ code: z.string() }).safeParse(raw).data?.code ?? 'delivery.failed';
        return;
      }
      clearPending();
      saved = parsed.data;
      model.savedRoomCode = saved.code;
      storeMembership();
      model.snapshot = null;
      active = true;
      connect();
    } catch {
      if (started && token === generation) model.error = 'delivery.failed';
    } finally {
      clearTimeout(timeout);
      requests.delete(controller);
      if (started && token === generation) {
        if (!active) model.admissionPending = false;
        paint();
      }
    }
  }
  const actions: UiActions = {
    create: (name, faceId) => {
      void admit('/api/rooms', name, faceId);
    },
    join: (code, name, faceId) => {
      void admit(`/api/rooms/${code}/join`, name, faceId);
    },
    resume: () => {
      if (started && saved && model.savedRoomCode && !model.admissionPending && !active) {
        active = true;
        model.admissionPending = true;
        model.snapshot = null;
        connect();
        paint();
      }
    },
    send: (command: Command) => {
      if (!started || !model.connected || !model.calibrated || document.hidden) return;
      const background = settingsEdit(command);
      const decision =
        pending && !pendingSettings
          ? 'reject'
          : commands.submit(command, pending?.command ?? null, background);
      if (decision === 'reject') return;
      if (background && command.type === 'configure')
        model.settingsDraft = structuredClone(command.setup);
      if (decision === 'send') beginCommand(command, background);
      else {
        updatePending();
        model.error = null;
        persistPending();
      }
      paint();
    },
    fresh,
  };
  function visibilityChanged(): void {
    if (!started || !active) return;
    model.calibrated = false;
    clock.reset();
    pings.clear();
    sendWire({ type: 'ready', ready: false });
    if (!document.hidden) {
      if (socket?.readyState === WebSocket.OPEN) ping();
      else connect();
    }
    paint();
  }
  async function boot(): Promise<void> {
    const token = generation;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    requests.add(controller);
    try {
      const parsed = savedSchema.safeParse(
        JSON.parse(storageRead('localStorage', storageKey) ?? 'null'),
      );
      if (parsed.success) {
        model.admissionPending = true;
        paint();
        const response = await fetch(`/api/rooms/${parsed.data.code}/recover`, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: parsed.data.credential }),
        });
        if (!started || token !== generation) return;
        if (response.ok) {
          saved = parsed.data;
          model.savedRoomCode = saved.code;
          const stored = z
            .object({
              code: z.string(),
              intent: z.unknown(),
              settingsEdit: z.boolean().optional(),
              queued: z.array(z.unknown()).max(2).optional(),
            })
            .safeParse(
              JSON.parse(storageRead('sessionStorage', 'playai.pending') ?? 'null'),
            );
          if (stored.success && stored.data.code === saved.code) {
            commands.clear();
            pending = parseIntent(stored.data.intent);
            pendingSettings =
              !!pending &&
              stored.data.settingsEdit === true &&
              pending.command.type === 'configure' &&
              !!pending.command.setup;
            if (pendingSettings && pending?.command.type === 'configure') {
              model.settingsDraft = structuredClone(pending.command.setup);
              for (const raw of stored.data.queued ?? []) {
                const parsedCommand = parseIntent({
                  actionId: crypto.randomUUID(),
                  command: raw,
                })?.command;
                if (!parsedCommand) {
                  commands.clear();
                  model.settingsDraft = structuredClone(pending.command.setup);
                  break;
                }
                const edit =
                  parsedCommand.type === 'configure' &&
                  parsedCommand.setup?.gameId === pending.command.setup?.gameId;
                if (commands.submit(parsedCommand, pending.command, edit) !== 'queued') {
                  commands.clear();
                  model.settingsDraft = structuredClone(pending.command.setup);
                  break;
                }
                if (edit && parsedCommand.type === 'configure')
                  model.settingsDraft = structuredClone(parsedCommand.setup);
              }
            }
            updatePending();
            if (pending) model.delivery = 'delivery.unknown';
          }
        }
      }
    } catch {
      /* Fresh entry remains available if storage or recovery is unavailable. */
    } finally {
      clearTimeout(timeout);
      requests.delete(controller);
    }
    if (!started || token !== generation) return;
    model.admissionPending = false;
    if (active && saved) connect();
    paint();
  }
  function start(): void {
    if (started) return;
    started = true;
    generation++;
    document.addEventListener('visibilitychange', visibilityChanged);
    paint();
    void boot();
  }
  function dispose(): void {
    if (!started) return;
    started = false;
    generation++;
    document.removeEventListener('visibilitychange', visibilityChanged);
    for (const request of requests) request.abort();
    requests.clear();
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (pingTimer) clearInterval(pingTimer);
    if (pendingTimer) clearTimeout(pendingTimer);
    reconnectTimer = pingTimer = pendingTimer = null;
    const previous = socket;
    socket = null;
    previous?.close();
    model.connected = false;
    model.calibrated = false;
    model.admissionPending = false;
    clock.reset();
    pings.clear();
    retrySent = false;
    updatePending();
  }
  return {
    getSnapshot: (): UiModel => published,
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    actions,
    start,
    dispose,
  };
}
export type RoomClient = ReturnType<typeof createRoomClient>;
