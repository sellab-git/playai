// @vitest-environment jsdom
import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomDialogs, type RoomDialogState } from '../src/client/RoomDialogs';
import type { UiModel, UiActions } from '../src/client/model';
import { RoomRunner } from '../src/room/runner';
import { games } from '../src/games/registry';
import { harness, profile } from './fixtures';

afterEach(cleanup);

function setup() {
  const h = harness();
  const runner = new RoomRunner(null, { ...h.deps, games });
  runner.create('ABCDE');
  runner.join(profile('Test'), '1'.repeat(64));
  const connection = runner.connect('1'.repeat(64));
  if (!connection.ok) throw new Error(connection.code);
  runner.ready(connection.value);
  const model: UiModel = {
    snapshot: runner.snapshot(connection.value),
    connected: true,
    calibrated: true,
    pending: false,
    error: null,
    delivery: null,
    savedRoomCode: null,
    now: 0,
    serverToLocal: (n) => n,
  };
  const actions: UiActions = {
    create: vi.fn(),
    join: vi.fn(),
    resume: vi.fn(),
    fresh: vi.fn(),
    send: vi.fn(),
  };
  function Host() {
    const [dialog, setDialog] = useState<RoomDialogState | null>(null);
    return (
      <>
        <button onClick={() => setDialog({ kind: 'menu' })}>Open</button>
        <RoomDialogs
          model={model}
          actions={actions}
          dialog={dialog}
          onClose={() => setDialog(null)}
          onNavigate={setDialog}
          onStart={vi.fn()}
          onFaceSelected={vi.fn()}
          gameMenu={[
            {
              label: 'Your stats',
              run: () =>
                setDialog({
                  kind: 'details',
                  title: 'Your stats',
                  body: <p>Statistics</p>,
                }),
            },
          ]}
          selectedFace="face-01"
        />
      </>
    );
  }
  render(<Host />);
  return { actions, user: userEvent.setup() };
}

it('contains keyboard focus and returns it to the opener after Escape', async () => {
  const { user } = setup();
  const opener = screen.getByRole('button', { name: 'Open' });
  await user.click(opener);
  const popup = screen.getByRole('dialog');
  for (let index = 0; index < 12; index++) {
    await user.tab();
    await waitFor(() => expect(popup.contains(document.activeElement)).toBe(true));
  }
  for (let index = 0; index < 12; index++) {
    await user.tab({ shift: true });
    await waitFor(() => expect(popup.contains(document.activeElement)).toBe(true));
  }
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(opener));
});

it('focuses nested page titles and keeps identity drafts through face selection and Back', async () => {
  const { user, actions } = setup();
  await user.click(screen.getByRole('button', { name: 'Open' }));
  await user.click(screen.getByRole('button', { name: 'Name and avatar' }));
  const name = screen.getByRole('textbox', { name: 'Your name' });
  await user.clear(name);
  await user.type(name, 'Ada');
  await user.click(screen.getByRole('button', { name: 'Change face' }));
  expect(document.activeElement).toBe(
    screen.getByRole('heading', { name: 'Choose a face' }),
  );
  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(document.activeElement).toBe(
    screen.getByRole('heading', { name: 'Name and avatar' }),
  );
  const restored = screen.getByRole('textbox', { name: 'Your name' });
  expect((restored as HTMLInputElement).value).toBe('Ada');
  await user.click(restored);
  await user.keyboard('{Enter}');
  expect(actions.send).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'profile',
      profile: expect.objectContaining({ name: 'Ada' }),
    }),
  );
});

it('focuses the invalid identity after pointer Save and associates its error', async () => {
  const { user, actions } = setup();
  await user.click(screen.getByRole('button', { name: 'Open' }));
  await user.click(screen.getByRole('button', { name: 'Name and avatar' }));
  const input = screen.getByRole('textbox', { name: 'Your name' });
  await user.clear(input);
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(document.activeElement).toBe(input);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id);
  expect(actions.send).not.toHaveBeenCalled();
});

it('retains the menu trail for game-provided details and closes the whole stack with X', async () => {
  const { user } = setup();
  const opener = screen.getByRole('button', { name: 'Open' });
  await user.click(opener);
  await user.click(screen.getByRole('button', { name: 'Your stats' }));
  expect(document.activeElement).toBe(
    screen.getByRole('heading', { name: 'Your stats' }),
  );
  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByRole('heading', { name: 'Room menu' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Your stats' }));
  await user.click(screen.getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(opener));
});
