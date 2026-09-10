// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../src/client/App';
import type { Intent, Snapshot } from '../src/engine';

type Wire = { type: string; credential?: string; intent?: Intent; t0?: number };
class Socket extends EventTarget {
  static OPEN = 1;
  static instances: Socket[] = [];
  readyState = 1;
  sent: Wire[] = [];
  constructor() {
    super();
    Socket.instances.push(this);
  }
  send(raw: string): void {
    this.sent.push(JSON.parse(raw) as Wire);
  }
  close(): void {
    this.readyState = 3;
    this.dispatchEvent(new Event('close'));
  }
  open(): void {
    this.dispatchEvent(new Event('open'));
  }
  message(value: unknown): void {
    this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(value) }));
  }
}

const credential = '1'.repeat(64);
const serverOrigin = 1700000000000;
const lobby: Snapshot = {
  version: 1,
  acknowledgement: null,
  selfId: 'host',
  notice: null,
  game: null,
  room: {
    code: 'ABCDE',
    createdAt: serverOrigin,
    hostId: 'host',
    status: 'lobby',
    gameId: null,
    totals: {},
    gamesPlayed: 0,
    players: [
      {
        id: 'host',
        name: 'Test',
        faceId: 'face-01',
        tile: 'tYel',
        connected: true,
        departed: false,
        joinedAt: serverOrigin,
        lastSeenAt: serverOrigin,
      },
    ],
    setup: {
      gameId: 'blindstop',
      settings: { rounds: 5, pace: 'manual', practice: false },
    },
  },
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  Socket.instances = [];
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  vi.stubGlobal('WebSocket', Socket);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('offers a fresh-room escape when admission succeeds but its first socket closes before any state', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'ABCDE', credential }) }));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Create room' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Your name' }), { target: { value: 'Test' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create room' }));
  await waitFor(() => expect(Socket.instances).toHaveLength(1));
  act(() => Socket.instances[0]!.close());
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  const fresh = screen.getByRole('button', { name: 'New room' });
  expect((fresh as HTMLButtonElement).disabled).toBe(false);
  expect((screen.getByRole('button', { name: 'Rejoin room' }) as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(fresh);
  expect(screen.getByRole('textbox', { name: 'Your name' })).toBeTruthy();
  expect((screen.getByRole('button', { name: 'Create room' }) as HTMLButtonElement).disabled).toBe(false);
  expect(localStorage.getItem('playai.membership')).toBeNull();
  expect(Socket.instances).toHaveLength(1);
});

it('releases admission controls when an unanswered POST reaches its timeout', async () => {
  vi.useFakeTimers();
  const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  }));
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Create room' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Your name' }), { target: { value: 'Test' } });
  const submit = screen.getByRole('button', { name: 'Create room' });
  fireEvent.click(submit);
  expect((submit as HTMLButtonElement).disabled).toBe(true);
  await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
  expect((submit as HTMLButtonElement).disabled).toBe(false);
  expect(screen.getByRole('alert').textContent).toBe('Could not save.');
  expect(Socket.instances).toHaveLength(0);
});

function membership(intent?: Intent): void {
  localStorage.setItem(
    'playai.membership',
    JSON.stringify({ code: 'ABCDE', credential }),
  );
  if (intent)
    sessionStorage.setItem(
      'playai.pending',
      JSON.stringify({ code: 'ABCDE', intent, settingsEdit: false, queued: [] }),
    );
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
}
async function rejoin(): Promise<Socket> {
  const button = await screen.findByRole('button', { name: 'Rejoin room' });
  expect((button as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(button);
  expect(Socket.instances).toHaveLength(1);
  const socket = Socket.instances[0]!;
  act(() => socket.open());
  expect(socket.sent).toContainEqual({ type: 'auth', credential });
  return socket;
}
function clockResponse(socket: Socket, serverNow = performance.now()): void {
  const ping = socket.sent.find((message) => message.type === 'ping');
  expect(ping?.t0).toBeTypeOf('number');
  act(() => socket.message({ type: 'clock', t0: ping!.t0, serverNow }));
}

it('recovers an unresolved leave through the real App transport and clears membership after its exact acknowledgement', async () => {
  const intent: Intent = { actionId: 'original-leave', command: { type: 'leave' } };
  membership(intent);
  render(<App />);
  const socket = await rejoin();
  act(() => socket.message({ type: 'state', snapshot: lobby }));
  expect(socket.sent.filter((message) => message.intent)).toEqual([]);
  clockResponse(socket);
  expect(
    socket.sent.filter((message) => message.intent).map((message) => message.intent),
  ).toEqual([intent]);
  act(() =>
    socket.message({
      type: 'ack',
      ack: { actionId: intent.actionId, accepted: true, code: 'ok', version: 2 },
    }),
  );
  await screen.findByRole('button', { name: 'Create room' });
  expect(screen.queryByRole('button', { name: 'Rejoin room' })).toBeNull();
  expect(localStorage.getItem('playai.membership')).toBeNull();
  expect(sessionStorage.getItem('playai.pending')).toBeNull();
});

it('keeps a fresh-room escape available when rejoin cannot obtain a socket state', async () => {
  membership({ actionId: 'waiting-leave', command: { type: 'leave' } });
  render(<App />);
  const socket = await rejoin();
  act(() => socket.close());
  const fresh = screen.getByRole('button', { name: 'New room' });
  expect(fresh).toHaveProperty('disabled', false);
  fireEvent.click(fresh);
  expect(screen.queryByRole('button', { name: 'Rejoin room' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Create room' })).toHaveProperty('disabled', false);
  expect(localStorage.getItem('playai.membership')).toBeNull();
  expect(sessionStorage.getItem('playai.pending')).toBeNull();
});

it('releases admission when a recovery HTTP request exceeds its deadline', async () => {
  vi.useFakeTimers();
  try {
    membership();
    vi.stubGlobal('fetch', vi.fn((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Create room' }));
    expect(screen.getByRole('button', { name: 'Create room' })).toHaveProperty('disabled', true);
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(screen.getByRole('button', { name: 'Create room' })).toHaveProperty('disabled', false);
  } finally { vi.useRealTimers(); }
});

it('calibrates a newly recovered active round before measuring a nonzero TAP', async () => {
  vi.spyOn(performance, 'now').mockReturnValue(6000);
  membership();
  render(<App />);
  const socket = await rejoin();
  const snapshot: Snapshot = {
    ...lobby,
    room: { ...lobby.room, status: 'playing', gameId: 'blindstop' },
    game: {
      gameId: 'blindstop',
      scope: { gameInstanceId: 'game-1', phaseEpoch: 2, roundId: 'round-1' },
      phase: {
        name: 'round',
        token: 'round-1-active',
        roundId: 'round-1',
        endsAt: serverOrigin + 20000,
      },
      private: { submitted: false },
      public: {
        phase: 'round',
        startAt: serverOrigin + 1000,
        endsAt: serverOrigin + 20000,
        targetMs: 5000,
        submitted: 0,
        submittedIds: [],
        total: 1,
        rows: [],
        rounds: 5,
        round: 1,
        practice: false,
        pace: 'manual',
        paused: false,
        nextAt: null,
        standings: [],
        history: [],
      },
    },
  };
  act(() => socket.message({ type: 'state', snapshot }));
  const tap = await screen.findByRole('button', { name: 'Tap' });
  expect((tap as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(tap);
  expect(socket.sent.filter((message) => message.intent)).toEqual([]);
  clockResponse(socket, serverOrigin + 6000);
  await waitFor(() => expect((tap as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(tap);
  const intents = socket.sent
    .filter((message) => message.intent)
    .map((message) => message.intent!);
  expect(intents).toHaveLength(1);
  expect(intents[0]!.command).toEqual({
    type: 'action',
    scope: snapshot.game!.scope,
    payload: { type: 'TAP', elapsedMs: 5000 },
  });
});

it('blocks duplicate admission while its request is unresolved and shows storage failure without aborting admission', async () => {
  let resolve: ((value: { ok: boolean; json(): Promise<unknown> }) => void) | undefined;
  const fetchMock = vi.fn(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Denied', 'SecurityError');
  });
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Create room' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Your name' }), {
    target: { value: 'Test' },
  });
  const submit = screen.getByRole('button', { name: 'Create room' });
  fireEvent.click(submit);
  fireEvent.click(submit);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect((submit as HTMLButtonElement).disabled).toBe(true);
  await act(async () => {
    resolve!({ ok: true, json: async () => ({ code: 'ABCDE', credential }) });
  });
  expect(Socket.instances).toHaveLength(1);
  expect(screen.getByText(/Browser storage is unavailable/)).toBeTruthy();
  act(() => Socket.instances[0]!.message({ type: 'state', snapshot: lobby }));
  clockResponse(Socket.instances[0]!);
  const start = await screen.findByRole('button', { name: 'Play solo' });
  expect((start as HTMLButtonElement).disabled).toBe(false);
});
