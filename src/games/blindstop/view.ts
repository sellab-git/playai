import type { Json } from '../../engine.ts';
import { t } from '../../client/i18n.ts';
import type { GameViewProps } from '../../client/views.ts';
import { escapeHtml, avatar, tick, ring, button, playerIdentity } from '../../client/presentation.ts';

interface Row { playerId: string; elapsedMs: number | null; errorMs: number | null; rank: number; award: number; }
interface Projection { targetMs: number; startAt: number; endsAt: number; phase: 'countdown' | 'round' | 'result'; submitted: number; total: number; rows: Row[]; }
const object = (value: Json): Record<string, Json> | null => value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
const number = (value: Json | undefined): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
function projection(value: Json): Projection | null {
  const raw = object(value); if (!raw) return null;
  const phase = raw.phase; const targetMs = number(raw.targetMs); const startAt = number(raw.startAt); const endsAt = number(raw.endsAt);
  if ((phase !== 'countdown' && phase !== 'round' && phase !== 'result') || targetMs === null || startAt === null || endsAt === null || !Array.isArray(raw.rows)) return null;
  const rows: Row[] = [];
  for (const value of raw.rows) { const row = object(value); if (!row || typeof row.playerId !== 'string') return null; const rank = number(row.rank), award = number(row.award); if (rank === null || award === null) return null; rows.push({ playerId: row.playerId, elapsedMs: number(row.elapsedMs), errorMs: number(row.errorMs), rank, award }); }
  return { targetMs, startAt, endsAt, phase, submitted: number(raw.submitted) ?? 0, total: number(raw.total) ?? 0, rows };
}
const privateSubmitted = (value: Json): boolean => object(value)?.submitted === true;
const time = (milliseconds: number): string => t('time.seconds', { value: (milliseconds / 1000).toFixed(2) });

const localStarts = new Map<string, number>();
const finalViews = new Set<string>();

function standings(props: GameViewProps, state: Projection, waiting: boolean, final: boolean): string {
  const players = waiting ? props.players.filter(player => !player.departed) : state.rows.flatMap(row => {
    const player = props.players.find(candidate => candidate.id === row.playerId);
    return player ? [player] : [];
  });
  const rows = players.map(player => {
    const row = state.rows.find(candidate => candidate.playerId === player.id);
    const saved = waiting && player.id === props.selfId && privateSubmitted(props.privateView);
    const value = waiting ? (saved ? tick() : '') : row?.errorMs === null || row?.errorMs === undefined ? t('blindstop.missed') : time(Math.abs(row.errorMs));
    const position = waiting || !row || row.errorMs === null ? '' : String(row.rank);
    return `<div class="player ${player.id === props.selfId ? 'self' : ''}">${avatar(player)}${playerIdentity(player, props.selfId, props.hostId)}<div class="value">${value}</div><div class="position">${position}</div></div>`;
  }).join('');
  return `<div class="roster"><div class="table-head"><span class="people-label">${t('blindstop.playersHeading', { count: players.length })}</span><span class="value">${waiting ? '' : t(final ? 'blindstop.averageHeading' : 'blindstop.errorHeading')}</span><span class="position">${waiting ? '' : t('blindstop.placeHeading')}</span></div><div class="roster-scroll" tabindex="0" role="region" aria-label="${t('blindstop.playersLabel')}">${rows}</div></div>`;
}

function winners(props: GameViewProps, state: Projection, final: boolean): string {
  const valid = state.rows.filter(row => row.errorMs !== null);
  const best = Math.min(...valid.map(row => row.rank));
  const leaders = valid.filter(row => row.rank === best);
  if (!leaders.length) return t('blindstop.noWinner');
  return leaders.length > 1 ? t('blindstop.roundTie', { count: leaders.length }) : t(final ? 'blindstop.winner' : 'blindstop.roundWinner', { name: escapeHtml(props.playerName(leaders[0]!.playerId)) });
}

function footer(props: GameViewProps, meta: string, primary: string, secondary = ''): void {
  props.footerRoot.innerHTML = `<p class="action-meta">${meta}</p>${primary}<div class="secondary-slot">${secondary}</div>`;
}

export function renderBlindstop(props: GameViewProps): void {
  const state = projection(props.publicView);
  if (!state) { props.root.innerHTML = `<p class="game-error">${t('error.generic')}</p>`; return; }
  const submitted = privateSubmitted(props.privateView);
  const roundKey = `${props.scope.gameInstanceId}:${props.scope.roundId}`;
  props.setTitle(t('blindstop.roundTitle'));
  if (state.phase !== 'result' && props.canAct && !localStarts.has(roundKey)) localStarts.set(roundKey, props.localTime(state.startAt));
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
        sent = true;
        tap.disabled = true;
        props.actions.send({ type: 'action', scope: props.scope, payload: { type: 'TAP', elapsedMs: performance.now() - localStart } });
      };
      tap?.addEventListener('pointerdown', event => { if (!event.isPrimary || event.button !== 0) return; event.preventDefault(); sendTap(); });
      tap?.addEventListener('click', sendTap);
      tap?.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) { event.preventDefault(); sendTap(); } });
    }
    return;
  }
  if (state.phase === 'round') {
    props.root.innerHTML = `<section class="game-layout"><div class="focal"><div class="locked-mark">${tick()}</div><h2>${t('blindstop.saved')}</h2><p class="message">${t(state.total - state.submitted === 1 ? 'blindstop.waitingLast' : state.total === state.submitted ? 'blindstop.waitingNone' : 'blindstop.waitingMore', { count: state.total - state.submitted })}</p></div>${standings(props, state, true, false)}</section>`;
    footer(props, t('blindstop.hidden'), `<div class="action-placeholder primary-slot">${t('blindstop.recorded')}</div>`);
    return;
  }
  localStarts.delete(roundKey);
  const final = finalViews.has(roundKey);
  const own = state.rows.find(row => row.playerId === props.selfId);
  const error = own?.errorMs ?? null;
  props.setTitle(t(final ? 'blindstop.finalTitle' : 'blindstop.resultTitle'));
  const measurement = error === null ? `<h2>${t('blindstop.missed')}</h2>` : `<p class="number">${(Math.abs(error) / 1000).toFixed(2)} <small>${t('blindstop.unit')}${error === 0 ? '' : ` ${t(error < 0 ? 'blindstop.earlyLabel' : 'blindstop.lateLabel')}`}</small></p>`;
  const focal = final ? `<h2>${winners(props, state, true)}</h2><p class="message">${error === null ? t('blindstop.noAverage') : t('blindstop.yourAverage', { time: time(Math.abs(error)) })}</p>` : `<p class="meta">${t('blindstop.yourTiming')}</p>${measurement}<p class="message">${winners(props, state, false)}</p>`;
  props.root.innerHTML = `<section class="game-layout"><div class="focal">${focal}</div>${standings(props, state, false, final)}</section>`;
  const place = own && error !== null ? t('blindstop.place', { rank: own.rank, total: state.total }) : '';
  if (!final) {
    footer(props, place, button('blindstop.seeFinal', 'see-final'));
    props.footerRoot.querySelector('[data-action="see-final"]')?.addEventListener('click', () => { finalViews.add(roundKey); renderBlindstop(props); const heading = props.root.querySelector('h2'); if (heading) { heading.tabIndex = -1; heading.focus(); } });
  } else if (props.isHost) {
    footer(props, place, button('blindstop.backToRoom', 'back-room', 'primary', !props.canAct));
    props.footerRoot.querySelector('[data-action="back-room"]')?.addEventListener('click', props.returnToRoom);
  } else {
    footer(props, place, `<div class="action-placeholder primary-slot">${t('blindstop.hostDecision', { name: escapeHtml(props.playerName(props.hostId ?? '')) })}</div>`);
  }
}

export default renderBlindstop;
