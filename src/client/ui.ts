import type { Command, Snapshot } from '../engine.ts';
import { defaultGame } from '../games/registry.ts';
import { t } from './i18n.ts';
import { gameView } from './views.ts';
import { avatar, button, escapeHtml, icon, playerIdentity } from './presentation.ts';
import { entryScreen } from './screens/EntryScreen.ts';
import { lobbyScreen } from './screens/LobbyScreen.ts';
import { eveningSummaryScreen } from './screens/EveningSummaryScreen.ts';

export interface UiModel {
  snapshot: Snapshot | null;
  connected: boolean;
  calibrated: boolean;
  pending: boolean;
  error: string | null;
  delivery: string | null;
  savedRoomCode: string | null;
  now: number;
  serverToLocal(serverTimestamp: number): number;
}
export interface UiActions {
  create(name: string, faceId: string): void;
  join(code: string, name: string, faceId: string): void;
  resume(): void;
  send(command: Command): void;
  fresh(): void;
}
type EntryMode = 'home' | 'create' | 'join' | 'recovery';
type DialogKind = 'faces' | 'menu' | 'invite' | 'rules' | 'points' | 'abort' | 'leave' | 'close';
let mode: EntryMode = 'home';
let name = '';
let code = '';
let faceId = 'face-01';
let hadSession = false;
let latest: { root: HTMLElement; model: UiModel; actions: UiActions };
let openDialog: { kind: DialogKind; context: string; trigger: string | null } | null = null;
const context = (model: UiModel): string => `${model.snapshot?.room.code}:${model.snapshot?.room.status}:${model.snapshot?.room.hostId}:${model.snapshot?.game?.scope.gameInstanceId}:${model.connected}`;
const host = (model: UiModel): boolean => !!model.snapshot && model.snapshot.room.hostId === model.snapshot.selfId;
const enabled = (model: UiModel): boolean => model.connected && model.calibrated && !model.pending;
const playerName = (model: UiModel, id: string): string => model.snapshot?.room.players.find(player => player.id === id)?.name ?? '';
function redraw(): void { render(latest.root, latest.model, latest.actions); }
function navigate(next: EntryMode): void { mode = next; redraw(); }
function fresh(): void { mode = 'home'; openDialog = null; latest.actions.fresh(); }
function saveDraft(root: HTMLElement): void {
  name = root.querySelector<HTMLInputElement>('#player-name')?.value ?? name;
  code = root.querySelector<HTMLInputElement>('#room-code')?.value ?? code;
}
function shell(root: HTMLElement, title: string, body: string, footer: string, model: UiModel): void {
  const back = !model.snapshot && (mode === 'join' || mode === 'create');
  const menu = model.snapshot && model.snapshot.room.status !== 'closed';
  const status = model.snapshot && !model.connected ? t('connection.reconnecting') : model.delivery && model.delivery !== 'delivery.saved' ? t(model.delivery) : '';
  root.innerHTML = `<main class="shell"><header class="header">${back ? `<button class="nav-button" data-action="home" aria-label="${t('nav.back')}">${icon('M21 7 11 16 21 25 M11 16H28')}</button>` : '<span></span>'}<div class="middle"><h1 id="screen-title">${escapeHtml(title)}</h1></div>${menu ? `<button class="nav-button right" data-action="menu" aria-label="${t('nav.menu')}">${icon('M5 9H27 M5 16H27 M5 23H27')}</button>` : '<span></span>'}</header><p class="connection-status" role="status">${escapeHtml(status)}</p><section class="body"><p class="ui-alert" role="alert">${model.error ? escapeHtml(t(model.error)) : ''}</p>${body}</section><footer class="actions"><div id="shell-actions">${footer}</div></footer></main>`;
}
function evening(model: UiModel): string {
  const snapshot = model.snapshot!;
  const room = snapshot.room;
  const ordered = room.players.slice().sort((a, b) => (room.totals[b.id] ?? 0) - (room.totals[a.id] ?? 0));
  const best = ordered.length ? room.totals[ordered[0]!.id] ?? 0 : 0;
  const leaders = ordered.filter(player => (room.totals[player.id] ?? 0) === best);
  const winner = !room.gamesPlayed ? t(room.status === 'closed' ? 'completed.body' : 'room.noGames') : leaders.length > 1 ? t('room.tie', { count: leaders.length }) : t('room.winner', { name: escapeHtml(leaders[0]?.name ?? '') });
  const rows = ordered.map(player => {
    const total = room.totals[player.id] ?? 0;
    const rank = 1 + ordered.filter(other => (room.totals[other.id] ?? 0) > total).length;
    return `<div class="player ${player.id === snapshot.selfId ? 'self' : ''}">${avatar(player)}${playerIdentity(player, snapshot.selfId, room.hostId)}<span class="value">${total}</span><span class="position">${rank}</span></div>`;
  }).join('');
  return eveningSummaryScreen(winner, room.gamesPlayed, rows);
}
function showDialog(kind: DialogKind, trigger: string | null = kind): void {
  saveDraft(latest.root);
  openDialog = { kind, context: context(latest.model), trigger };
  drawDialog();
}
function drawDialog(): void {
  const { root, model } = latest;
  root.querySelector('dialog')?.remove();
  if (!openDialog) return;
  const { kind, trigger } = openDialog;
  const confirm = kind === 'abort' || kind === 'leave' || kind === 'close';
  const titles: Record<DialogKind, string> = { faces: 'entry.face', menu: 'nav.menu', invite: 'room.invite', rules: 'room.rules', points: 'room.points', abort: 'confirm.abort.title', leave: 'confirm.leave.title', close: 'confirm.close.title' };
  let body = '';
  if (kind === 'faces') body = `<div class="face-gallery">${Array.from({ length: 25 }, (_, i) => { const id = `face-${String(i + 1).padStart(2, '0')}`; return `<button data-face="${id}" aria-label="${t('entry.faceChoice', { number: i + 1 })}" aria-pressed="${faceId === id}">${avatar({ faceId: id, tile: 'tYel' })}</button>`; }).join('')}</div>`;
  if (kind === 'invite') body = `<p>${t('room.inviteBody')}</p><p class="room-code">${escapeHtml(model.snapshot?.room.code ?? '')}</p>`;
  if (kind === 'rules') body = `<p>${t(defaultGame.taglineKey)}</p>`;
  if (kind === 'points') body = evening(model);
  if (kind === 'menu') body = `<div class="dialog-actions">${button('room.invite', 'invite', 'secondary')}${button('room.rules', 'rules', 'secondary')}${button('room.points', 'points', 'secondary')}${host(model) ? (model.snapshot?.room.status === 'playing' ? button('lobby.abort', 'abort', 'secondary', !enabled(model)) : '') + button('lobby.close', 'close', 'secondary', !enabled(model)) : button('lobby.leave', 'leave', 'secondary', !enabled(model))}</div>`;
  if (confirm) body = `<p>${t(`confirm.${kind}.body`)}</p>`;
  const node = document.createElement('dialog');
  node.className = 'confirm-dialog';
  node.setAttribute('aria-labelledby', 'dialog-title');
  node.innerHTML = `<div class="dialog-head"><h2 id="dialog-title">${t(titles[kind])}</h2><button class="close-button" data-dismiss aria-label="${t('nav.close')}">${icon('M7 7 25 25 M25 7 7 25')}</button></div><div class="dialog-body">${body}</div><div class="dialog-actions">${confirm ? button('confirm.confirm', 'confirm', 'primary', !enabled(model)) : ''}<button class="button secondary" data-dismiss>${t(confirm ? 'confirm.cancel' : 'nav.done')}</button></div>`;
  const dismiss = (): void => { openDialog = null; node.close(); redraw(); if (trigger) root.querySelector<HTMLElement>(`[data-action="${trigger}"]`)?.focus(); };
  node.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  node.querySelectorAll('[data-dismiss]').forEach(element => element.addEventListener('click', dismiss));
  node.querySelectorAll<HTMLButtonElement>('[data-face]').forEach(element => element.addEventListener('click', () => { faceId = element.dataset.face!; dismiss(); }));
  node.querySelector('[data-action="confirm"]')?.addEventListener('click', () => {
    if (!confirm || !enabled(latest.model) || context(latest.model) !== openDialog?.context) return;
    openDialog = null; node.close(); latest.actions.send({ type: kind });
  });
  node.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(element => {
    if (element.dataset.action !== 'confirm') element.addEventListener('click', () => showDialog(element.dataset.action as DialogKind, 'menu'));
  });
  root.appendChild(node); node.showModal();
  node.querySelector<HTMLElement>('[data-dismiss]')?.focus();
}
function bind(root: HTMLElement, model: UiModel, actions: UiActions): void {
  root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(element => element.addEventListener('click', () => {
    const action = element.dataset.action;
    saveDraft(root);
    if (action === 'home' || action === 'create' || action === 'join') navigate(action);
    else if (action === 'fresh') fresh();
    else if (action === 'resume') actions.resume();
    else if (action === 'start' && enabled(model)) actions.send({ type: 'start', gameId: defaultGame.id, settings: defaultGame.defaultSettings });
    else if (action === 'faces' || action === 'menu' || action === 'invite') showDialog(action);
  }));
  root.querySelector<HTMLFormElement>('#entry-form')?.addEventListener('submit', event => {
    event.preventDefault(); saveDraft(root);
    if (model.pending) return;
    name = name.trim(); code = code.trim().toUpperCase();
    if (!name) { root.querySelector<HTMLInputElement>('#player-name')?.focus(); return; }
    if (mode === 'create') actions.create(name, faceId);
    else if (mode === 'join') actions.join(code, name, faceId);
  });
}
export function render(root: HTMLElement, model: UiModel, actions: UiActions): void {
  let announcer = document.getElementById('game-announcer');
  if (!announcer) { announcer = document.createElement('p'); announcer.id = 'game-announcer'; announcer.className = 'sr-only'; announcer.setAttribute('role', 'status'); announcer.setAttribute('aria-live', 'polite'); document.body.appendChild(announcer); }
  latest = { root, model, actions };
  saveDraft(root);
  if (openDialog && root.querySelector('dialog') && openDialog.context === context(model)) {
    root.querySelectorAll<HTMLButtonElement>('dialog [data-action="confirm"], dialog [data-action="abort"], dialog [data-action="close"], dialog [data-action="leave"]').forEach(control => { control.disabled = !enabled(model); });
    return;
  }
  openDialog = null;
  const active = document.activeElement;
  const focusedId = active instanceof HTMLElement && root.contains(active) ? active.id : '';
  const focusedAction = active instanceof HTMLElement && root.contains(active) ? active.dataset.action : undefined;
  const selection = active instanceof HTMLInputElement ? [active.selectionStart, active.selectionEnd] : null;
  const snapshot = model.snapshot;
  if (!snapshot) {
    if (hadSession) mode = 'home';
    hadSession = false;
    if (mode === 'home' && model.savedRoomCode) mode = 'recovery';
    if (mode === 'recovery' && !model.savedRoomCode) mode = 'home';
    const footer = mode === 'home' ? `<div class="action-row two">${button('entry.joinAction', 'join', 'secondary')}${button('entry.createAction', 'create')}</div>` : mode === 'recovery' ? `<div class="action-row two">${button('entry.newRoom', 'fresh', 'secondary', model.pending)}${button('entry.rejoin', 'resume', 'primary', model.pending)}</div>` : `<button class="button primary" form="entry-form" type="submit" ${model.pending ? 'disabled' : ''}>${t(mode === 'create' ? 'entry.createAction' : 'entry.joinAction')}</button>`;
    shell(root, t('app.title'), entryScreen(mode, name, code, faceId, model.savedRoomCode), footer, model);
  } else {
    hadSession = true;
    if (snapshot.room.status === 'closed') shell(root, t('room.evening'), evening(model), button('entry.newRoom', 'fresh'), model);
    else if (snapshot.room.status === 'lobby' || !snapshot.game) {
      const players = snapshot.room.players.filter(player => !player.departed);
      const roster = players.map(player => `<div class="player ${player.id === snapshot.selfId ? 'self' : ''}">${avatar(player)}${playerIdentity(player, snapshot.selfId, snapshot.room.hostId)}</div>`).join('');
      const canStart = enabled(model) && players.filter(player => player.connected).length >= defaultGame.minPlayers;
      const footer = host(model) ? button('lobby.start', 'start', 'primary', !canStart) : `<p class="action-meta">${t('lobby.waiting', { name: escapeHtml(playerName(model, snapshot.room.hostId ?? '')) })}</p>`;
      shell(root, t(defaultGame.nameKey), lobbyScreen(t(defaultGame.taglineKey), escapeHtml(snapshot.room.code), players.length, roster), footer, model);
    } else {
      shell(root, t(defaultGame.nameKey), '<div id="game-view"></div>', '', model);
      const gameRoot = root.querySelector<HTMLElement>('#game-view')!;
      const footerRoot = root.querySelector<HTMLElement>('#shell-actions')!;
      const game = snapshot.game;
      void gameView(game.gameId).then(view => {
        if (root.querySelector('#game-view') !== gameRoot) return;
        if (!view) { gameRoot.innerHTML = `<p>${t('error.generic')}</p>`; return; }
        view({ root: gameRoot, footerRoot, publicView: game.public, privateView: game.private, now: model.now, actions, scope: game.scope, playerName: id => playerName(model, id), selfId: snapshot.selfId, isHost: host(model), canAct: enabled(model), localTime: model.serverToLocal, players: snapshot.room.players, hostId: snapshot.room.hostId, setTitle: title => { root.querySelector('#screen-title')!.textContent = title; }, announce: message => { if (announcer.textContent !== message) announcer.textContent = message; }, returnToRoom: () => actions.send({ type: 'lobby' }) });
        if (focusedAction) footerRoot.querySelector<HTMLElement>(`[data-action="${focusedAction}"]`)?.focus();
      });
    }
  }
  bind(root, model, actions);
  const replacement = focusedId ? document.getElementById(focusedId) : focusedAction ? root.querySelector<HTMLElement>(`[data-action="${focusedAction}"]`) : null;
  replacement?.focus();
  if (replacement instanceof HTMLInputElement && selection?.[0] !== null && selection?.[1] !== null && selection) replacement.setSelectionRange(selection[0]!, selection[1]!);
}
