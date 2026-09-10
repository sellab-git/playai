import type { Command, Snapshot } from '../engine.ts';
import { defaultGame } from '../games/registry.ts';
import { t, type MessageKey } from './i18n.ts';
import { gameView } from './views.ts';
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

type DialogKind = 'abort' | 'leave' | 'close' | null;
let dialog: DialogKind = null;
let dialogInstance: string | undefined;
let dialogStatus: string | undefined;
let entryMode: 'create' | 'join' = 'create';
let entryName = '';
let entryCode = '';
let faceId = 'face-01';

const escape = (value: string): string => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c] ?? c);
const playerName = (model: UiModel, id: string): string => model.snapshot?.room.players.find(player => player.id === id)?.name ?? '';
const isHost = (model: UiModel): boolean => model.snapshot?.room.hostId === model.snapshot?.selfId;
const avatar = (id: string, _name: string, tile = 'tYel'): string => {
  const safeTile = ['tYel', 'tRed', 'tBlu', 'tGrn', 'tPur', 'tOrg', 'tPnk', 'tGry'].includes(tile) ? tile : 'tYel';
  return `<span class="avatar tile-${safeTile}" aria-hidden="true"><img src="/assets/avatars/${escape(id)}.svg" alt="" /></span>`;
};

function shell(root: HTMLElement, title: string, body: string, footer: string, model: UiModel, hasSession = true): void {
  const status = !model.connected && hasSession ? t('connection.reconnecting') : model.delivery ? t(model.delivery) : '';
  const error = model.error ? t(model.error) : '';
  root.innerHTML = `<main class="shell"><header class="shell-header"><h1>${escape(title)}</h1></header><section class="scroll-body"><div id="ui-alert" class="ui-alert" role="alert">${escape(error)}</div>${body}</section><footer class="shell-footer"><p class="footer-status" role="status" aria-live="polite">${escape(status)}</p><div id="shell-actions">${footer}</div></footer></main>`;
}

function entry(root: HTMLElement, model: UiModel, actions: UiActions): void {
  const codeField = entryMode === 'join' ? `<label for="room-code">${t('entry.code')}</label><input id="room-code" name="code" inputmode="text" autocomplete="off" maxlength="5" value="${escape(entryCode)}" />` : '';
  const faces = Array.from({ length: 8 }, (_, index) => `face-${String(index + 1).padStart(2, '0')}`)
    .map((id, index) => `<button class="face ${id === faceId ? 'selected' : ''}" type="button" data-face="${id}" aria-label="${t('entry.faceChoice', { number: index + 1 })}" aria-pressed="${id === faceId}">${avatar(id, '')}</button>`).join('');
  const resume = model.savedRoomCode ? `<button class="quiet-button" type="button" data-resume>${t('entry.resume')}</button>` : '';
  shell(root, t('app.title'), entryScreen({ title: t('entry.title'), createLabel: t('entry.create'), joinLabel: t('entry.join'), createSelected: entryMode === 'create', nameLabel: t('entry.name'), name: escape(entryName), codeField, faceLabel: t('entry.face'), faces, resume }), `<button class="primary-button" form="entry-form" type="submit" ${model.pending ? 'disabled' : ''}>${entryMode === 'create' ? t('entry.createAction') : t('entry.joinAction')}</button>`, model, false);
  const preserveDraft = (): void => { entryName = root.querySelector<HTMLInputElement>('#player-name')?.value ?? entryName; entryCode = root.querySelector<HTMLInputElement>('#room-code')?.value ?? entryCode; };
  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.addEventListener('click', () => { preserveDraft(); entryMode = button.dataset.mode === 'join' ? 'join' : 'create'; entry(root, model, actions); }));
  root.querySelectorAll<HTMLButtonElement>('[data-face]').forEach(button => button.addEventListener('click', () => { preserveDraft(); faceId = button.dataset.face ?? faceId; entry(root, model, actions); }));
  root.querySelector<HTMLButtonElement>('[data-resume]')?.addEventListener('click', actions.resume);
  root.querySelector<HTMLFormElement>('#entry-form')?.addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const data = new FormData(form); entryName = String(data.get('name') ?? '').trim(); entryCode = String(data.get('code') ?? '').trim().toUpperCase(); if (!entryName || (entryMode === 'join' && entryCode.length !== 5)) return; if (entryMode === 'create') actions.create(entryName, faceId); else actions.join(entryCode, entryName, faceId); });
}

function lobby(root: HTMLElement, model: UiModel, actions: UiActions): void {
  const snapshot = model.snapshot!;
  const room = snapshot.room;
  const host = playerName(model, room.hostId ?? '');
  const manifest = defaultGame;
  const roster = room.players.filter(player => !player.departed).map(player => `<li>${avatar(player.faceId, player.name, player.tile)}<span class="player-name">${escape(player.name)}</span><span class="total num">${room.totals[player.id] ?? 0}</span>${player.id === room.hostId ? `<span class="host-mark">${t('lobby.hostTag')}</span>` : ''}</li>`).join('');
  const canStart = room.players.filter(player => !player.departed && player.connected).length >= manifest.minPlayers && !model.pending && model.connected && model.calibrated;
  const hostControls = isHost(model) ? `<button class="text-button" data-dialog="close" ${model.pending || !model.connected ? 'disabled' : ''}>${t('lobby.close')}</button>` : `<p class="waiting-copy">${t('lobby.waiting', { name: escape(host) })}</p>`;
  const footer = isHost(model) ? `<button class="primary-button" data-start ${canStart ? '' : 'disabled'}>${t('lobby.start')}</button>` : `<button class="text-button" data-dialog="leave" ${model.pending || !model.connected ? 'disabled' : ''}>${t('lobby.leave')}</button>`;
  shell(root, t('lobby.title', { code: room.code }), lobbyScreen({ gameName: t(manifest.nameKey), tagline: t(manifest.taglineKey), roster, controls: hostControls }), footer, model);
  root.querySelector<HTMLButtonElement>('[data-start]')?.addEventListener('click', () => actions.send({ type: 'start', gameId: manifest.id, settings: manifest.defaultSettings }));
  bindDialogs(root, model, actions);
}

function bindDialogs(root: HTMLElement, model: UiModel, actions: UiActions): void {
  root.querySelectorAll<HTMLButtonElement>('[data-dialog]').forEach(button => button.addEventListener('click', () => { dialog = (button.dataset.dialog as DialogKind) ?? null; dialogInstance = model.snapshot?.game?.scope.gameInstanceId; dialogStatus = model.snapshot?.room.status; render(root, model, actions); }));
}
function modal(root: HTMLElement, model: UiModel, actions: UiActions): void {
  if (!dialog) return;
  const kind = dialog;
  const title = t(`confirm.${kind}.title` as MessageKey);
  const body = t(`confirm.${kind}.body` as MessageKey);
  const node = document.createElement('dialog'); node.className = 'confirm-dialog';
  node.innerHTML = `<form method="dialog"><h2>${title}</h2><p>${body}</p><div><button value="cancel">${t('confirm.cancel')}</button><button value="confirm" class="primary-button">${t('confirm.confirm')}</button></div></form>`;
  node.addEventListener('close', () => { const choice = node.returnValue; dialog = null; if (choice === 'confirm') actions.send({ type: kind }); else render(root, model, actions); root.querySelector<HTMLElement>(`[data-dialog="${kind}"]`)?.focus(); });
  root.appendChild(node); node.showModal();
}

export function render(root: HTMLElement, model: UiModel, actions: UiActions): void {
  if (dialog && root.querySelector('dialog') && model.connected && model.snapshot?.game?.scope.gameInstanceId === dialogInstance && model.snapshot?.room.status === dialogStatus) return;
  if (root.querySelector('dialog')) dialog = null;
  const active = document.activeElement;
  const focusedId = active instanceof HTMLInputElement && root.contains(active) ? active.id : null;
  const selectionStart = active instanceof HTMLInputElement ? active.selectionStart : null;
  const selectionEnd = active instanceof HTMLInputElement ? active.selectionEnd : null;
  const currentName = root.querySelector<HTMLInputElement>('#player-name');
  const currentCode = root.querySelector<HTMLInputElement>('#room-code');
  if (currentName) entryName = currentName.value;
  if (currentCode) entryCode = currentCode.value;
  const snapshot = model.snapshot;
  if (!snapshot) entry(root, model, actions);
  else if (snapshot.room.status === 'closed') {
    const totals = snapshot.room.players.slice().sort((a, b) => (snapshot.room.totals[b.id] ?? 0) - (snapshot.room.totals[a.id] ?? 0)).map((player, index) => `<li><span class="rank num">${index + 1}</span>${avatar(player.faceId, player.name, player.tile)}<span class="player-name">${escape(player.name)}</span><span class="total num">${snapshot.room.totals[player.id] ?? 0}</span></li>`).join('');
    shell(root, t('completed.title'), eveningSummaryScreen(t('completed.body'), totals), `<button class="primary-button" data-fresh>${t('completed.fresh')}</button>`, model);
  }
  else if (snapshot.room.status === 'lobby' || !snapshot.game) lobby(root, model, actions);
  else {
    shell(root, t('app.title'), '<div id="game-view"></div>', '', model);
    const gameRoot = root.querySelector<HTMLElement>('#game-view')!;
    const footerRoot = root.querySelector<HTMLElement>('#shell-actions')!;
    const game = snapshot.game;
    void gameView(game.gameId).then(view => {
      if (!view || root.querySelector('#game-view') !== gameRoot) { gameRoot.innerHTML = `<p class="game-error">${t('error.generic')}</p>`; return; }
      view({ root: gameRoot, footerRoot, publicView: game.public, privateView: game.private, now: model.now, actions, scope: game.scope, playerName: id => playerName(model, id), selfId: snapshot.selfId, isHost: isHost(model), canAct: model.connected && model.calibrated && !model.pending, localTime: model.serverToLocal });
      if (snapshot.room.status === 'completed') footerRoot.innerHTML = isHost(model) ? `<button class="primary-button" data-lobby ${model.pending || !model.connected || !model.calibrated ? 'disabled' : ''}>${t('lobby.back')}</button>` : `<p class="waiting-copy">${t('lobby.waiting', { name: escape(playerName(model, snapshot.room.hostId ?? '')) })}</p>`;
      footerRoot.querySelector<HTMLButtonElement>('[data-lobby]')?.addEventListener('click', () => actions.send({ type: 'lobby' }));
      if (snapshot.room.status === 'playing') {
        const controls = document.createElement('div');
        controls.innerHTML = `<button class="text-button" data-dialog="${isHost(model) ? 'abort' : 'leave'}" ${model.pending || !model.connected || !model.calibrated ? 'disabled' : ''}>${t(isHost(model) ? 'lobby.abort' : 'lobby.leave')}</button>`;
        footerRoot.appendChild(controls);
        bindDialogs(root, model, actions);
      }
    });
    bindDialogs(root, model, actions);
  }
  root.querySelector<HTMLButtonElement>('[data-fresh]')?.addEventListener('click', actions.fresh);
  root.querySelector<HTMLButtonElement>('[data-lobby]')?.addEventListener('click', () => actions.send({ type: 'lobby' }));
  modal(root, model, actions);
  if (focusedId) {
    const replacement = root.querySelector<HTMLInputElement>(`#${focusedId}`);
    if (replacement) {
      replacement.focus();
      if (selectionStart !== null && selectionEnd !== null) replacement.setSelectionRange(selectionStart, selectionEnd);
    }
  }
}
