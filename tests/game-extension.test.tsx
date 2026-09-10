// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactGameClient } from '../src/client/game-contract';
import type { Snapshot } from '../src/engine';
import type { UiActions, UiModel } from '../src/client/model';
import { RoomApp } from '../src/client/App';
import { gameClients } from '../src/client/react-games';

vi.mock('../src/client/react-games', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/client/react-games')>();
  const { t } = await import('../src/client/i18n');
  const { createElement } = await import('react');
  // This intentionally has no engine, Blindstop view type or production registration.
  const second: ReactGameClient = {
    manifest: {
      id: 'extension-fixture',
      nameKey: 'room.details',
      taglineKey: 'home.body',
      markId: 'fixture-mark',
      minPlayers: 1,
      maxPlayers: 4,
      estimatedMinutes: [1, 2],
      defaultSettings: { difficulty: 2 },
      awardPolicy: 'team',
    },
    Mark: () => (
      <svg data-testid="extension-mark" aria-hidden="true">
        <path d="M0 0L10 10" />
      </svg>
    ),
    Settings: ({ disabled, onChange }) => (
      <button disabled={disabled} onClick={() => onChange({ difficulty: 4 })}>
        {t('room.saveIdentity')}
      </button>
    ),
    Screen: ({ publicView, privateView, calibrated, actions, scope }) => (
      <section data-testid="extension-screen">
        <output>{JSON.stringify({ publicView, privateView, calibrated })}</output>
        <button
          onClick={() =>
            actions.send({
              type: 'action',
              scope,
              payload: { type: 'CHOOSE', choice: 'alpha' },
            })
          }
        >
          {t('room.details')}
        </button>
      </section>
    ),
    rules: createElement('p', null, t('home.body')),
    practice: {
      title: 'room.details',
      body: 'home.body',
      action: 'entry.createAction',
      skip: 'nav.back',
    },
    getTitle: (_, completed) => t(completed ? 'room.share' : 'room.people'),
    summary: (settings) => JSON.stringify(settings),
    startSettings: (settings, practice) => ({ chosen: settings, practice }),
  };
  const clients = { ...actual.gameClients, [second.manifest.id]: second };
  return {
    ...actual,
    gameClients: clients,
    manifests: Object.fromEntries(
      Object.entries(clients).map(([id, client]) => [id, client.manifest]),
    ),
  };
});

afterEach(cleanup);

it('uses a second descriptor for catalogue, preparation, title and game actions without changing room code', () => {
  const descriptor = gameClients['extension-fixture'];
  const snapshot: Snapshot = {
    version: 1,
    acknowledgement: null,
    notice: null,
    selfId: 'host',
    game: null,
    room: {
      code: 'ABCDE',
      createdAt: 0,
      hostId: 'host',
      status: 'lobby',
      gameId: null,
      totals: {},
      gamesPlayed: 0,
      gamesStarted: 1,
      setup: null,
      players: [
        {
          id: 'host',
          name: 'Test',
          faceId: 'face-01',
          tile: 'tYel',
          connected: true,
          departed: false,
          joinedAt: 0,
          lastSeenAt: 0,
        },
      ],
    },
  };
  const model: UiModel = {
    snapshot,
    connected: true,
    calibrated: true,
    pending: false,
    error: null,
    delivery: null,
    savedRoomCode: null,
    now: 1000,
    serverToLocal: (time) => time,
  };
  const actions: UiActions = {
    create: vi.fn(),
    join: vi.fn(),
    resume: vi.fn(),
    fresh: vi.fn(),
    send: vi.fn(),
  };
  const view = render(<RoomApp model={model} actions={actions} />);
  expect(screen.getByTestId('extension-mark')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /^Details/ }));
  expect(actions.send).toHaveBeenLastCalledWith({
    type: 'configure',
    setup: { gameId: descriptor.manifest.id, settings: { difficulty: 2 } },
  });

  snapshot.room.setup = { gameId: descriptor.manifest.id, settings: { difficulty: 2 } };
  view.rerender(<RoomApp model={{ ...model }} actions={actions} />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Details');
  fireEvent.click(screen.getByRole('button', { name: /Game settings/ }));
  expect(screen.getByText('{"difficulty":2}')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(actions.send).toHaveBeenLastCalledWith({
    type: 'configure',
    setup: { gameId: descriptor.manifest.id, settings: { difficulty: 4 } },
  });
  model.settingsDraft = { gameId: descriptor.manifest.id, settings: { difficulty: 4 } };
  view.rerender(<RoomApp model={{ ...model }} actions={actions} />);
  fireEvent.click(screen.getByRole('button', { name: 'Play solo' }));
  expect(actions.send).toHaveBeenLastCalledWith({
    type: 'start',
    gameId: descriptor.manifest.id,
    settings: { chosen: { difficulty: 4 }, practice: false },
  });

  const scope = { gameInstanceId: 'fixture-1', phaseEpoch: 1, roundId: 'choice-1' };
  snapshot.room.status = 'playing';
  snapshot.room.gameId = descriptor.manifest.id;
  snapshot.game = {
    gameId: descriptor.manifest.id,
    scope,
    phase: { name: 'choose', token: 'choice-1', roundId: 'choice-1', endsAt: 3000 },
    public: { choices: 2 },
    private: { role: 'chooser' },
  };
  view.rerender(<RoomApp model={{ ...model }} actions={actions} />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Room participants');
  expect(screen.getByTestId('extension-screen').textContent).toContain(
    '{"publicView":{"choices":2},"privateView":{"role":"chooser"},"calibrated":true}',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Details' }));
  expect(actions.send).toHaveBeenLastCalledWith({
    type: 'action',
    scope,
    payload: { type: 'CHOOSE', choice: 'alpha' },
  });
  snapshot.room.status = 'completed';
  view.rerender(<RoomApp model={{ ...model }} actions={actions} />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Share results');
});
