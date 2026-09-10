// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { GameScreen } from '../src/games/blindstop/GameScreen';
import type { GameScreenProps } from '../src/client/game-contract';
import type { Json } from '../src/engine';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const view = (overrides: Record<string, Json> = {}): Json => ({
  phase: 'result',
  targetMs: 5000,
  startAt: 1000,
  endsAt: 14000,
  submitted: 1,
  submittedIds: ['p'],
  total: 1,
  rows: [{ playerId: 'p', elapsedMs: 5100, errorMs: 100, rank: 1, award: 0 }],
  rounds: 3,
  round: 1,
  practice: false,
  pace: 'manual',
  paused: false,
  nextAt: null,
  standings: [
    { playerId: 'p', completed: 1, missed: 0, meanErrorMs: 100, rank: 1, award: 1 },
  ],
  history: [],
  ...overrides,
});
function props(overrides: Partial<GameScreenProps> = {}): GameScreenProps {
  return {
    publicView: view(),
    privateView: {},
    now: 6000,
    actions: {
      create: vi.fn(),
      join: vi.fn(),
      resume: vi.fn(),
      send: vi.fn(),
      fresh: vi.fn(),
    },
    scope: { gameInstanceId: 'game-1', roundId: 'round-1', phaseEpoch: 2 },
    playerName: () => 'Artur',
    selfId: 'p',
    isHost: true,
    canAct: true,
    calibrated: true,
    completed: false,
    players: [
      {
        id: 'p',
        name: 'Artur',
        faceId: 'face-01',
        tile: 'tYel',
        connected: true,
        departed: false,
        joinedAt: 0,
        lastSeenAt: 0,
      },
    ],
    hostId: 'p',
    announce: vi.fn(),
    returnToRoom: vi.fn(),
    chooseGame: vi.fn(),
    registerMenu: vi.fn(),
    openDialog: vi.fn(),
    localTime: (timestamp) => timestamp - 500,
    ...overrides,
  };
}
function deliberateClick(target: HTMLElement): void {
  fireEvent.pointerDown(target);
  fireEvent.click(target, { detail: 1 });
}

describe('React game interaction lifecycle', () => {
  it('waits for clock calibration when recovering directly into an active round', () => {
    vi.spyOn(performance, 'now').mockReturnValue(6000);
    const epoch = 1700000000000;
    const current = props({
      publicView: view({
        phase: 'round',
        startAt: epoch + 1000,
        submittedIds: [],
        submitted: 0,
      }),
      calibrated: false,
      canAct: false,
      localTime: (timestamp) => timestamp,
    });
    const rendered = render(<GameScreen {...current} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tap' }));
    expect(current.actions.send).not.toHaveBeenCalled();
    rendered.rerender(
      <GameScreen
        {...current}
        calibrated
        canAct
        localTime={(timestamp) => timestamp - epoch}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tap' }));
    expect(current.actions.send).toHaveBeenCalledExactlyOnceWith({
      type: 'action',
      scope: current.scope,
      payload: { type: 'TAP', elapsedMs: 5000 },
    });
  });
  it('does not transfer the release of a game tap to the new Next action', () => {
    const current = props({
      publicView: view({ phase: 'round', submittedIds: [], submitted: 0 }),
    });
    const rendered = render(<GameScreen {...current} />);
    const tap = screen.getByRole('button', { name: 'Tap' });
    const press = new MouseEvent('pointerdown', { bubbles: true, button: 0 });
    Object.defineProperty(press, 'isPrimary', { value: true });
    fireEvent(tap, press);
    expect(current.actions.send).toHaveBeenCalledTimes(1);
    rendered.rerender(<GameScreen {...current} publicView={view()} />);
    const next = screen.getByRole('button', { name: 'Next round' });
    expect(next).not.toBe(tap);
    fireEvent.click(next, { detail: 1 });
    expect(current.actions.send).toHaveBeenCalledTimes(1);
    deliberateClick(next);
    expect(current.actions.send).toHaveBeenLastCalledWith({
      type: 'action',
      scope: current.scope,
      payload: { type: 'NEXT' },
    });
    expect(current.actions.send).toHaveBeenCalledTimes(2);
  });
  it('retains a deliberate press through timer snapshots but not across different rounds', () => {
    const current = props({ publicView: view({ pace: 'auto', nextAt: 14000 }) });
    const rendered = render(<GameScreen {...current} />);
    const next = screen.getByRole('button', { name: 'Next round' });
    fireEvent.pointerDown(next);
    rendered.rerender(<GameScreen {...current} now={7000} />);
    expect(screen.getByRole('button', { name: 'Next round' })).toBe(next);
    fireEvent.click(next, { detail: 1 });
    expect(current.actions.send).toHaveBeenCalledTimes(1);
    fireEvent.pointerDown(next);
    const scope = { ...current.scope, roundId: 'round-2', phaseEpoch: 5 };
    rendered.rerender(
      <GameScreen {...current} scope={scope} publicView={view({ round: 2 })} />,
    );
    const second = screen.getByRole('button', { name: 'Next round' });
    expect(second).not.toBe(next);
    fireEvent.click(second, { detail: 1 });
    expect(current.actions.send).toHaveBeenCalledTimes(1);
    fireEvent.click(second, { detail: 0 });
    expect(current.actions.send).toHaveBeenLastCalledWith({
      type: 'action',
      scope,
      payload: { type: 'NEXT' },
    });
  });
  it('uses calibrated local monotonic time once, retaining it across a connection interruption', () => {
    vi.spyOn(performance, 'now').mockReturnValue(5800);
    const current = props({
      publicView: view({ phase: 'countdown', submittedIds: [], submitted: 0 }),
      now: 900,
    });
    const rendered = render(<GameScreen {...current} />);
    expect(screen.getByRole('button', { name: 'Get ready' })).toHaveProperty(
      'disabled',
      true,
    );
    rendered.rerender(
      <GameScreen
        {...current}
        publicView={view({ phase: 'round', submittedIds: [], submitted: 0 })}
        canAct={false}
      />,
    );
    expect(screen.getByRole('button', { name: 'Tap' })).toHaveProperty('disabled', true);
    rendered.rerender(
      <GameScreen
        {...current}
        publicView={view({ phase: 'round', submittedIds: [], submitted: 0 })}
        localTime={() => 9999}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tap' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tap' }));
    expect(current.actions.send).toHaveBeenCalledTimes(1);
    expect(current.actions.send).toHaveBeenCalledWith({
      type: 'action',
      scope: current.scope,
      payload: { type: 'TAP', elapsedMs: 5300 },
    });
  });
  it('updates countdown copy in place and sends the latest pause/resume scope', () => {
    const clock = vi.spyOn(performance, 'now').mockReturnValue(6000);
    const current = props({ publicView: view({ pace: 'auto', nextAt: 14000 }) });
    const rendered = render(<GameScreen {...current} />);
    const next = screen.getByRole('button', { name: 'Next round' });
    expect(screen.getByText('Next round in 8 s')).toBeTruthy();
    clock.mockReturnValue(8000);
    rendered.rerender(
      <GameScreen {...current} now={8000} localTime={(timestamp) => timestamp - 501} />,
    );
    expect(screen.getByText('Next round in 6 s')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next round' })).toBe(next);
    fireEvent.click(screen.getByRole('button', { name: 'Pause countdown' }));
    expect(current.actions.send).toHaveBeenLastCalledWith({
      type: 'action',
      scope: current.scope,
      payload: { type: 'PAUSE' },
    });
    const scope = { ...current.scope, phaseEpoch: 3 };
    rendered.rerender(
      <GameScreen
        {...current}
        scope={scope}
        publicView={view({ pace: 'auto', paused: true, nextAt: null })}
      />,
    );
    expect(screen.getByText('Countdown paused')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Resume countdown' }));
    expect(current.actions.send).toHaveBeenLastCalledWith({
      type: 'action',
      scope,
      payload: { type: 'RESUME' },
    });
  });
});
