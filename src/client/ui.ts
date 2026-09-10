import type { Command, Snapshot, Json } from '../engine.ts';
import { defaultGame, games } from '../games/registry.ts';
import { t } from './i18n.ts';
import { gameView, gameClient, loadedGameClient, type GameView } from './views.ts';
import { avatar, button, escapeHtml, icon, playerIdentity, tick } from './presentation.ts';
import { entryScreen } from './screens/EntryScreen.ts';
import { lobbyScreen } from './screens/LobbyScreen.ts';
import { eveningSummaryScreen } from './screens/EveningSummaryScreen.ts';
import { invitation, qrMarkup, eveningText } from './sharing.ts';

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
type DialogKind = 'faces' | 'menu' | 'invite' | 'rules' | 'points' | 'abort' | 'leave' | 'close' | 'practice' | 'details' | 'people' | 'identity' | 'share';
let gameMenu: Array<{ label: string; run(): void }> = [];
let onGameMenuOpen: (() => void) | undefined;
let detail = { title: '', body: '' };
let identityName = '', identityFace = 'face-01';
let faceReturn: 'identity' | null = null;
let faceDraft = 'face-01';
let renderedContext = '';
let preparationKey = '';
let settingsFocus = '';
const preparationIdentity = (model: UiModel): string => model.snapshot?.room.status === 'lobby' && model.snapshot.room.setup ? JSON.stringify([context(model),model.snapshot.selfId,model.snapshot.room.players,model.snapshot.room.setup.gameId]) : '';

const dialogTrail: Array<{ dialog: NonNullable<typeof openDialog>; detail: typeof detail; identityName: string; identityFace: string; faceDraft: string; faceReturn: 'identity' | null }> = [];
const loadingClients = new Set<string>();
const manifest = (model: UiModel) => Object.values(games).find(entry => entry.manifest.id === (model.snapshot?.room.setup?.gameId ?? model.snapshot?.game?.gameId))?.manifest ?? defaultGame;
const preparation = (model: UiModel) => loadedGameClient(manifest(model).id)?.preparation;
const roomSettings = (model: UiModel): Json => model.snapshot?.room.setup?.settings ?? manifest(model).defaultSettings;
function startGame(practice: boolean): void { const {model,actions} = latest; if (enabled(model)) actions.send({ type: 'start', gameId: manifest(model).id, settings: preparation(model)?.startSettings(roomSettings(model), practice) ?? roomSettings(model) }); }
const initialCode = new URLSearchParams(location.search).get('code') ?? '';
let mode: EntryMode = /^[A-HJ-NP-Z2-9]{5}$/.test(initialCode) ? 'join' : 'home';
let name = '';
let code = mode === 'join' ? initialCode : '';
let faceId = 'face-01';
let hadSession = false;
let latest: { root: HTMLElement; model: UiModel; actions: UiActions };
let openDialog: { kind: DialogKind; context: string; trigger: string | null } | null = null;
const context = (model: UiModel): string => `${model.snapshot?.room.code}:${model.snapshot?.room.status}:${model.snapshot?.room.hostId}:${model.snapshot?.game?.scope.gameInstanceId}:${model.snapshot?.game?.phase.name}:${model.snapshot?.game?.scope.roundId}:${model.connected}`;
const host = (model: UiModel): boolean => !!model.snapshot && model.snapshot.room.hostId === model.snapshot.selfId;
const enabled = (model: UiModel): boolean => model.connected && model.calibrated && !model.pending;
const playerName = (model: UiModel, id: string): string => model.snapshot?.room.players.find(player => player.id === id)?.name ?? '';
function redraw(): void { render(latest.root, latest.model, latest.actions); }
function navigate(next: EntryMode): void { mode = next; redraw(); }
function fresh(): void { mode = 'create'; hadSession=false; openDialog = null; latest.actions.fresh(); }
function saveDraft(root: HTMLElement): void {
  name = root.querySelector<HTMLInputElement>('#player-name')?.value ?? name;
  code = root.querySelector<HTMLInputElement>('#room-code')?.value ?? code;
}
function shell(root: HTMLElement, title: string, body: string, footer: string, model: UiModel): void {
  const back = !model.snapshot && (mode === 'join' || mode === 'create');
  const menu = model.snapshot && model.snapshot.room.status !== 'closed';
  const status = model.snapshot && !model.connected ? t('connection.reconnecting') : model.delivery && model.delivery !== 'delivery.saved' ? t(model.delivery) : '';
  root.innerHTML = `<main class="shell"><header class="header">${back ? `<button class="nav-button" data-action="home" aria-label="${t('nav.back')}">${icon('M21 7 11 16 21 25 M11 16H28')}</button>` : '<span></span>'}<div class="middle"><h1 id="screen-title">${escapeHtml(title)}</h1></div>${menu ? `<button class="nav-button right" data-action="menu" ${model.pending ? 'disabled' : ''} aria-label="${t('nav.menu')}">${icon('M5 9H27 M5 16H27 M5 23H27')}</button>` : '<span></span>'}</header><p class="connection-status" role="status">${escapeHtml(status)}</p><section class="body"><p class="ui-alert" role="alert">${model.error ? escapeHtml(t(model.error)) : ''}</p>${body}</section><footer class="actions"><div id="shell-actions">${footer}</div></footer></main>`;
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
  if (openDialog && openDialog.kind !== kind) dialogTrail.push({dialog:{...openDialog},detail:{...detail},identityName,identityFace,faceDraft,faceReturn});
  if (kind === 'faces') faceDraft = faceReturn ? identityFace : faceId;
  if (kind === 'menu') { faceReturn=null; onGameMenuOpen?.(); }
  if (kind === 'identity' && !faceReturn) {
    const self = latest.model.snapshot?.room.players.find(player => player.id === latest.model.snapshot?.selfId);
    identityName = self?.name ?? ''; identityFace = self?.faceId ?? 'face-01';
  }
  openDialog = { kind, context: context(latest.model), trigger }; drawDialog();
}
function drawDialog(): void {
  const { root, model } = latest;
  root.querySelector('dialog')?.remove();
  if (!openDialog) return;
  const { kind, trigger } = openDialog;
  const confirm = kind === 'abort' || kind === 'leave' || kind === 'close';
  const titles: Record<DialogKind, string> = { faces:'entry.face',menu:'nav.menu',invite:'room.invite',rules:'room.rules',points:'room.points',abort:'confirm.abort.title',leave:'confirm.leave.title',close:'confirm.close.title',practice:preparation(model)?.practice.title ?? 'lobby.start',details:'room.details',people:'room.people',identity:'room.identity',share:'room.share' };
  const inRoom = model.snapshot?.room.status === 'lobby';
  let body = '';
  if (kind === 'faces') body = `<div class="face-gallery">${Array.from({length:25},(_,i)=>{const id=`face-${String(i+1).padStart(2,'0')}`;return `<button data-face="${id}" aria-label="${t('entry.faceChoice',{number:i+1})}" aria-pressed="${faceDraft===id}">${avatar({faceId:id,tile:'tYel'})}</button>`;}).join('')}</div>`;
  if (kind === 'invite') body = `<div class="invitation">${qrMarkup(invitation(model.snapshot?.room.code??''))}<p class="room-code">${escapeHtml(model.snapshot?.room.code ?? '')}</p><p class="meta">${t('room.inviteBody')}</p><div class="dialog-actions">${button('room.copyCode','copy-code','secondary')}${button('room.copyLink','copy-link','secondary')}</div></div>`;
  if (kind === 'rules') body = preparation(model)?.rules() ?? `<p>${t(manifest(model).taglineKey)}</p>`;
  if (kind === 'points') body = evening(model) + `<div class="dialog-actions">${button('room.share','share-results')}</div>`;
  if (kind === 'share' && model.snapshot) body = `<p class="meta">${t('room.shareHint')}</p><pre class="share-text">${escapeHtml(eveningText(model.snapshot.room))}</pre><div class="dialog-actions">${typeof navigator.share === 'function' ? button('room.shareSend','share-native') : ''}${button('room.copyResults','copy-results','secondary')}</div>`;
  if (kind === 'details') body = detail.body;
  if (kind === 'practice') { const choice=preparation(model)?.practice; body=`<p>${t(choice?.body ?? 'error.generic')}</p><div class="dialog-actions">${button(choice?.action ?? 'lobby.start','practice-start')}${button(choice?.skip ?? 'lobby.start','real-start','secondary')}</div>`; }
  if (kind === 'identity') body = `<div class="field"><label for="identity-name">${t('entry.name')}</label><input id="identity-name" maxlength="12" value="${escapeHtml(identityName)}" required /></div><div class="face-preview">${avatar({faceId:identityFace,tile:model.snapshot?.room.players.find(player=>player.id===model.snapshot?.selfId)?.tile ?? 'tYel'})}${button('entry.changeFace','identity-faces','secondary')}</div>${button('room.saveIdentity','save-identity','primary',!enabled(model))}`;
  if (kind === 'people') body = `<div class="room-people">${model.snapshot?.room.players.filter(player=>!player.departed).map(player=>`<div class="person-row">${avatar(player)}${playerIdentity(player,model.snapshot!.selfId,model.snapshot!.room.hostId)}${host(model)&&player.id!==model.snapshot?.selfId?`<button class="text-action" data-remove="${escapeHtml(player.id)}">${t('room.remove')}</button>`:''}</div>`).join('')}</div>`;
  if (kind === 'menu') body = `<div class="dialog-actions">${gameMenu.map((item,index)=>`<button class="button secondary" data-game-menu="${index}">${escapeHtml(item.label)}</button>`).join('')}${button('room.rules','rules','secondary')}${inRoom ? button('room.invite','invite','secondary')+button('room.people','people','secondary')+button('room.identity','identity','secondary')+button('room.points','points','secondary') : ''}${host(model) ? (model.snapshot?.room.status === 'playing' ? button('lobby.abort','abort','secondary',!enabled(model)) : '') + (inRoom?button('lobby.close','close','secondary',!enabled(model)):'') : button('lobby.leave','leave','secondary',!enabled(model))}</div>`;
  if (confirm) body = `<p>${t(`confirm.${kind}.body`)}</p>`;
  const node = document.createElement('dialog'); node.className='confirm-dialog'; node.setAttribute('aria-labelledby','dialog-title');
  node.innerHTML=`<div class="dialog-head">${dialogTrail.length?`<button class="close-button" data-action="dialog-back" aria-label="${t('nav.back')}">${icon('M21 7 11 16 21 25')}</button>`:''}<h2 id="dialog-title">${kind==='details'?escapeHtml(detail.title):kind==='rules'?t('room.gameRules',{game:t(manifest(model).nameKey)}):t(titles[kind])}</h2><button class="close-button" data-dismiss aria-label="${t('nav.close')}">${icon('M7 7 25 25 M25 7 7 25')}</button></div><div class="dialog-body">${body}</div><p class="error" id="dialog-error" role="alert"></p><p class="copy-status" id="copy-status" role="status"></p>${confirm||kind==='faces'?`<div class="dialog-actions">${confirm?button('confirm.confirm','confirm','primary',!enabled(model)):button('entry.useFace','save-face')}</div>`:''}`;
  const dismiss=():void=>{openDialog=null;dialogTrail.length=0;faceReturn=null;node.close();redraw();if(trigger)root.querySelector<HTMLElement>(`[data-action="${trigger}"]`)?.focus();};
  const back=():void=>{const previous=dialogTrail.pop();if(!previous){dismiss();return;}openDialog=previous.dialog;detail=previous.detail;identityName=previous.identityName;identityFace=previous.identityFace;faceDraft=previous.faceDraft;faceReturn=previous.faceReturn;drawDialog();};
  let outsidePress=false;
  const outside=(event:MouseEvent):boolean=>{const box=node.getBoundingClientRect();return event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom;};
  node.addEventListener('pointerdown',event=>{outsidePress=event.target===node&&outside(event);});
  node.addEventListener('click',event=>{if(outsidePress&&event.target===node&&outside(event))dismiss();outsidePress=false;});
  node.addEventListener('cancel',event=>{event.preventDefault();if(dialogTrail.length)back();else dismiss();});
  node.querySelectorAll('[data-dismiss]').forEach(element=>element.addEventListener('click',dismiss));
  node.querySelectorAll<HTMLButtonElement>('[data-face]').forEach(element=>element.addEventListener('click',()=>{faceDraft=element.dataset.face!;node.querySelectorAll<HTMLButtonElement>('[data-face]').forEach(face=>face.setAttribute('aria-pressed',String(face.dataset.face===faceDraft)));}));
  node.querySelector<HTMLInputElement>('#identity-name')?.addEventListener('input',event=>{identityName=(event.target as HTMLInputElement).value;});
  node.querySelectorAll<HTMLButtonElement>('[data-game-menu]').forEach(element=>element.addEventListener('click',()=>gameMenu[Number(element.dataset.gameMenu)]?.run()));
  node.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach(element=>element.addEventListener('click',()=>{
    const playerId=element.dataset.remove!;
    detail={title:t('room.removeTitle'),body:`<p>${t('room.removeBody',{name:escapeHtml(playerName(latest.model,playerId))})}</p>${button('room.remove','confirm-remove')}`};
    showDialog('details','menu');
    root.querySelector('[data-action="confirm-remove"]')?.addEventListener('click',()=>{if(enabled(latest.model)){openDialog=null;latest.actions.send({type:'kick',playerId});}});
  }));
  node.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(element=>element.addEventListener('click',async()=>{
    const action=element.dataset.action;
    if(action==='confirm'){if(!confirm||!enabled(latest.model)||context(latest.model)!==openDialog?.context)return;openDialog=null;node.close();latest.actions.send({type:kind});}
    else if(action==='save-face'){if(faceReturn){const selected=faceDraft;back();identityFace=selected;faceReturn=null;drawDialog();}else{faceId=faceDraft;dismiss();}}
    else if(action==='dialog-back')back();
    else if(action==='practice-start'||action==='real-start'){openDialog=null;node.close();startGame(action==='practice-start');}
    else if(action==='identity-faces'){faceReturn='identity';showDialog('faces','menu');}
    else if(action==='save-identity'){if(!identityName.trim()){node.querySelector('#dialog-error')!.textContent=t('join.invalid');return;}if(enabled(latest.model)){openDialog=null;latest.actions.send({type:'profile',profile:{name:identityName.trim(),faceId:identityFace}});}}
    else if(action==='share-results')showDialog('share');
    else if(action==='share-native' && latest.model.snapshot){try{await navigator.share({text:eveningText(latest.model.snapshot.room)});}catch(error){if(!(error instanceof DOMException && error.name==='AbortError'))node.querySelector('#dialog-error')!.textContent=t('room.shareFallback');}}
    else if(action==='copy-code'||action==='copy-link'||action==='copy-results'){
      const room=latest.model.snapshot?.room;if(!room)return;
      const value=action==='copy-link'?invitation(room.code):action==='copy-results'?eveningText(room):room.code;
      try{await navigator.clipboard.writeText(value);copyFeedback(element,node,action);node.querySelector('#dialog-error')!.textContent='';}
      catch{node.querySelector('#dialog-error')!.textContent=t(action==='copy-results'?'room.shareFallback':'room.copyFallback');}
    }
    else if(['invite','rules','points','abort','leave','close','people','identity'].includes(action??''))showDialog(action as DialogKind,'menu');
  }));
  root.appendChild(node);node.showModal();node.querySelector<HTMLElement>('[data-dismiss]')?.focus();
}

const statusTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
const copyTimers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();
function copyFeedback(element: HTMLButtonElement, node: HTMLElement, action: string): void {
  const label=action==='copy-link'?'room.copyLink':action==='copy-results'?'room.copyResults':'room.copyCode';
  const status=action==='copy-link'?'room.linkCopied':action==='copy-results'?'room.resultsCopied':'room.codeCopied';
  clearTimeout(copyTimers.get(element));
  element.innerHTML=tick()+t(label);
  clearTimeout(statusTimers.get(node));
  node.querySelector('#copy-status')!.textContent=t(status);
  statusTimers.set(node,setTimeout(()=>{node.querySelector('#copy-status')!.textContent='';},1800));
  copyTimers.set(element,setTimeout(()=>{element.textContent=t(label);},1800));
}

function bind(root: HTMLElement, model: UiModel, actions: UiActions): void {
  root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(element => element.addEventListener('click', async () => {
    const action = element.dataset.action;
    saveDraft(root);
    if (action === 'home' || action === 'create' || action === 'join') navigate(action);
    else if (action === 'fresh') fresh();
    else if (action === 'resume') actions.resume();
    else if (action === 'share' && model.snapshot) showDialog('share');
    else if (action === 'start' && enabled(model)) { if (!(model.snapshot?.room.gamesStarted ?? model.snapshot?.room.gamesPlayed) && preparation(model)) showDialog('practice'); else startGame(false); }
    else if (action === 'select' && enabled(model)) actions.send({type:'configure',setup:{gameId:element.dataset.game??defaultGame.id,settings:Object.values(games).find(entry=>entry.manifest.id===element.dataset.game)?.manifest.defaultSettings??defaultGame.defaultSettings}});
    else if (action === 'catalogue' && enabled(model)) actions.send({type:'configure',setup:null});
    else if (action === 'faces' || action === 'menu' || action === 'invite') showDialog(action);
  }));
  const panel=root.querySelector<HTMLDetailsElement>('#preparation-options');
  if(panel){
    panel.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, [data-round-preset]').forEach(input=>{input.disabled=!enabled(model);});
    if(!panel.dataset.bound){
      panel.dataset.bound='true';
      panel.addEventListener('pointerdown',event=>{if((event.target as Element).closest('[data-round-preset]'))event.preventDefault();});
      panel.addEventListener('click',event=>{const preset=(event.target as Element).closest<HTMLButtonElement>('[data-round-preset]');if(!preset||!enabled(latest.model))return;const input=panel.querySelector<HTMLInputElement>('#setup-rounds');if(input){input.value=preset.dataset.roundPreset!;input.dispatchEvent(new Event('change',{bubbles:true}));}});
      panel.addEventListener('change',()=>{
        const settings=preparation(latest.model)?.read(panel);
        panel.querySelector('#settings-error')!.textContent=settings?'':t('room.invalidSettings');
        const start=root.querySelector<HTMLButtonElement>('[data-action="start"]');if(start)start.disabled=!settings||!enabled(latest.model);
        if(settings&&enabled(latest.model)) { settingsFocus=(document.activeElement as HTMLElement)?.id??''; latest.actions.send({type:'configure',setup:{gameId:manifest(latest.model).id,settings}}); }
      });
      panel.addEventListener('input',()=>{const start=root.querySelector<HTMLButtonElement>('[data-action="start"]');if(start)start.disabled=!preparation(latest.model)?.read(panel)||!enabled(latest.model);});
    }
    if(!preparation(model)?.read(panel)){const start=root.querySelector<HTMLButtonElement>('[data-action="start"]');if(start)start.disabled=true;}
  }
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
  const selectedId = manifest(model).id;
  if (!loadedGameClient(selectedId) && !loadingClients.has(selectedId)) {
    loadingClients.add(selectedId);
    void gameClient(selectedId).then(() => redraw()).catch(() => { model.error='error.generic'; redraw(); });
  }
  saveDraft(root);
  if (openDialog && root.querySelector('dialog') && openDialog.context === context(model)) {
    root.querySelectorAll<HTMLButtonElement>('dialog [data-action="confirm"], dialog [data-action="abort"], dialog [data-action="close"], dialog [data-action="leave"]').forEach(control => { control.disabled = !enabled(model); });
    const error=root.querySelector('#dialog-error'); if(error && model.error)error.textContent=t(model.error);
    return;
  }
  openDialog = null; dialogTrail.length=0;
  const currentPreparation=preparationIdentity(model);
  const mountedPanel=root.querySelector<HTMLDetailsElement>('#preparation-options');
  if(currentPreparation && currentPreparation===preparationKey && mountedPanel?.querySelector('input') && preparation(model)) {
    mountedPanel.querySelector('summary strong')!.textContent=preparation(model)!.summary(roomSettings(model));
    mountedPanel.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, [data-round-preset]').forEach(control=>{control.disabled=!enabled(model);});
    const valid=preparation(model)!.read(mountedPanel);
    const start=root.querySelector<HTMLButtonElement>('[data-action="start"]');
    if(start)start.disabled=!valid||!enabled(model)||model.snapshot!.room.players.filter(player=>player.connected&&!player.departed).length<manifest(model).minPlayers;
    const status=root.querySelector<HTMLElement>('#settings-save-status');if(status)status.textContent=t(model.pending?'setup.saving':'setup.saved');
    root.querySelector('.ui-alert')!.textContent=model.error?t(model.error):'';
    root.querySelector('.connection-status')!.textContent=!model.connected?t('connection.reconnecting'):model.delivery&&model.delivery!=='delivery.saved'&&model.delivery!=='delivery.sending'?t(model.delivery):'';
    const menu=root.querySelector<HTMLButtonElement>('.header [data-action="menu"]');if(menu)menu.disabled=model.pending;
    if(!model.pending&&settingsFocus){root.querySelector<HTMLElement>(`#${settingsFocus}`)?.focus({preventScroll:true});settingsFocus='';}
    return;
  }
  preparationKey=currentPreparation;
  const active = document.activeElement;
  const preserveRoster = renderedContext === context(model);
  const settingsPanel = preserveRoster && mountedPanel?.querySelector('input') ? mountedPanel : null;
  const rosterScroll = preserveRoster ? root.querySelector<HTMLElement>('.roster-scroll')?.scrollTop ?? 0 : 0;
  const rosterFocused = preserveRoster && active instanceof HTMLElement && active.classList.contains('roster-scroll');
  renderedContext = context(model);
  const restoreRoster = (): void => { const roster = root.querySelector<HTMLElement>('.roster-scroll'); if(roster){roster.scrollTop=rosterScroll;if(rosterFocused)roster.focus({preventScroll:true});} };
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
    if (snapshot.room.status === 'closed') shell(root, t('room.evening'), evening(model), `<div class="action-row two">${button('entry.newRoom','fresh','secondary')}${button('room.share','share')}</div>`, model);
    else if (snapshot.room.status === 'lobby' || !snapshot.game) {
      gameMenu=[]; onGameMenuOpen=undefined;
      const players = snapshot.room.players.filter(player => !player.departed);
      const roster = players.map(player => `<div class="player ${player.id === snapshot.selfId ? 'self' : ''}">${avatar(player)}${playerIdentity(player, snapshot.selfId, snapshot.room.hostId)}</div>`).join('');
      const canStart = enabled(model) && !!preparation(model) && players.filter(player => player.connected).length >= manifest(model).minPlayers;
      const footer = host(model) ? button(players.length===1 && manifest(model).minPlayers===1?'lobby.startSolo':'lobby.start', 'start', 'primary', !canStart) : `<p class="action-meta">${t('lobby.waiting', { name: escapeHtml(playerName(model, snapshot.room.hostId ?? '')) })}</p>`;
      if (!snapshot.room.setup) {
        const cards=Object.values(games).map(entry=>`<button class="game-card" data-action="select" data-game="${escapeHtml(entry.manifest.id)}" ${!host(model)||!enabled(model)?'disabled':''}><span class="ink-mark">${icon('M12 3h8 M16 3v4 M16 10v9l5 3 M27 19a11 11 0 1 1-22 0 11 11 0 0 1 22 0')}</span><span><strong>${t(entry.manifest.nameKey)}</strong><small>${t(entry.manifest.taglineKey)}</small></span>${icon('M11 7 21 16 11 25')}</button>`).join('');
        shell(root,t('app.title'),`<section class="catalogue"><div class="room-context"><span>${escapeHtml(snapshot.room.code)} · ${t('lobby.players',{count:players.length})}</span><button class="text-action" data-action="invite">${t('room.invite')}</button></div><h2>${t('room.chooseGame')}</h2><div>${cards}</div></section>`,host(model)?'':`<p class="action-meta">${t('room.waitingSelection')}</p>`,model);
      } else {
        shell(root, t(manifest(model).nameKey), lobbyScreen(t(manifest(model).taglineKey), escapeHtml(snapshot.room.code), players.length, roster, preparation(model)?.summary(roomSettings(model))??'',host(model),preparation(model)?.form(roomSettings(model))??''), footer, model);
        if(host(model))root.querySelector('.header > span')!.outerHTML=`<button class="nav-button" data-action="catalogue" aria-label="${t('room.games')}">${icon('M21 7 11 16 21 25')}</button>`;
      }
    } else {
      const existingTitle=root.querySelector('#screen-title')?.textContent;
      shell(root, existingTitle || t(manifest(model).nameKey), '<div id="game-view"></div>', '', model);
      const gameRoot = root.querySelector<HTMLElement>('#game-view')!;
      const footerRoot = root.querySelector<HTMLElement>('#shell-actions')!;
      const game = snapshot.game;
      const paintGame=(view:GameView|null):void => {
        if (root.querySelector('#game-view') !== gameRoot) return;
        if (!view) { gameRoot.innerHTML = `<p>${t('error.generic')}</p>`; return; }
        view({ root: gameRoot, footerRoot, publicView: game.public, privateView: game.private, now: model.now, actions, scope: game.scope, playerName: id => playerName(model, id), selfId: snapshot.selfId, isHost: host(model), canAct: enabled(model), completed: snapshot.room.status === 'completed', localTime: model.serverToLocal, players: snapshot.room.players, hostId: snapshot.room.hostId, setTitle: title => { root.querySelector('#screen-title')!.textContent = title; }, announce: message => { if (announcer.textContent !== message) announcer.textContent = message; }, returnToRoom: () => actions.send({ type: 'lobby',destination:'preparation' }),chooseGame:()=>actions.send({type:'lobby',destination:'catalogue'}),registerMenu:(items,onOpen)=>{gameMenu=items;onGameMenuOpen=onOpen;},openDialog:(title,body)=>{detail={title,body};showDialog('details','menu');} });
        restoreRoster();
        if (focusedAction) footerRoot.querySelector<HTMLElement>(`[data-action="${focusedAction}"]`)?.focus({preventScroll:true});
      };
      const cached=loadedGameClient(game.gameId);
      if(cached)paintGame(cached.default);else void gameView(game.gameId).then(paintGame);
    }
  }
  if(settingsPanel && root.querySelector('#preparation-options')) { const replacement=root.querySelector('#preparation-options')!; settingsPanel.querySelector('summary strong')!.textContent=replacement.querySelector('summary strong')!.textContent; replacement.replaceWith(settingsPanel); }
  restoreRoster();
  bind(root, model, actions);
  const replacement = focusedId ? document.getElementById(focusedId) : focusedAction ? root.querySelector<HTMLElement>(`[data-action="${focusedAction}"]`) : null;
  replacement?.focus({preventScroll:true});
  if (replacement instanceof HTMLInputElement && selection?.[0] !== null && selection?.[1] !== null && selection && ['text','search','tel','url','password'].includes(replacement.type)) replacement.setSelectionRange(selection[0]!, selection[1]!);
}
