import type { Json } from '../../engine.ts';
import { t } from '../../client/i18n.ts';
import type { GameViewProps } from '../../client/views.ts';

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
const escape = (value: string): string => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char] ?? char);
const localStarts = new Map<string, number>();

export function renderBlindstop(props: GameViewProps): void {
  const state = projection(props.publicView);
  if (!state) { props.root.innerHTML = `<p class="game-error">${t('error.generic')}</p>`; return; }
  const submitted = privateSubmitted(props.privateView);
  const roundKey = `${props.scope.gameInstanceId}:${props.scope.roundId}`;
  if ((state.phase === 'countdown' || state.phase === 'round') && props.canAct && !localStarts.has(roundKey)) localStarts.set(roundKey, props.localTime(state.startAt));
  if (state.phase === 'countdown') {
    const remaining = Math.min(3, Math.max(0, Math.ceil((state.startAt - props.now) / 1000)));
    props.root.innerHTML = `<section class="blindstop countdown"><p>${t('blindstop.getReady')}</p><p class="countdown-number num">${remaining}</p><p class="target num">${t('blindstop.target', { time: time(state.targetMs) })}</p></section>`;
    return;
  }
  if (state.phase === 'round') {
    props.root.innerHTML = submitted ? `<section class="blindstop waiting"><svg class="ink-tick" viewBox="0 0 100 80" aria-hidden="true"><path d="M9 42 34 66 91 10" /></svg><h2>${t('blindstop.waiting')}</h2><p>${t('blindstop.progress', { submitted: state.submitted, total: state.total })}</p></section>` : `<section class="blindstop tap"><p class="target num">${t('blindstop.target', { time: time(state.targetMs) })}</p><p>${t('blindstop.progress', { submitted: state.submitted, total: state.total })}</p></section>`;
    if (!submitted) {
      props.footerRoot.innerHTML = `<button class="primary-button tap-action" type="button" ${props.canAct ? '' : 'disabled'}>${t('blindstop.tap')}</button>`;
      const tap = props.footerRoot.querySelector<HTMLButtonElement>('.tap-action');
      const localStart = localStarts.get(roundKey) ?? props.localTime(state.startAt);
      const sendTap = (): void => props.actions.send({ type: 'action', scope: props.scope, payload: { type: 'TAP', elapsedMs: performance.now() - localStart } });
      tap?.addEventListener('pointerdown', event => { event.preventDefault(); if (props.canAct) sendTap(); });
      tap?.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && props.canAct) { event.preventDefault(); sendTap(); } });
    }
    return;
  }
  localStarts.delete(roundKey);
  const rows = state.rows.map(row => { const measurement = row.errorMs === null ? t('blindstop.missed') : row.errorMs === 0 ? t('blindstop.exact') : row.errorMs < 0 ? t('blindstop.early', { time: time(Math.abs(row.errorMs)) }) : t('blindstop.late', { time: time(row.errorMs) }); return `<li><span class="rank num">${row.rank}</span><span>${escape(props.playerName(row.playerId))}</span><span class="num">${measurement}</span><span class="award num">${t('blindstop.award', { award: row.award })}</span></li>`; }).join('');
  props.root.innerHTML = `<section class="blindstop results"><h2>${t('blindstop.results')}</h2><ul class="results-list">${rows}</ul></section>`;
}

export default renderBlindstop;
