import { t } from '../i18n.ts';
export function eveningSummaryScreen(winner: string, count: number, rows: string): string {
  return `<section class="closed-screen"><div class="focal"><p class="meta">${t('room.gamesPlayed', { count })}</p><h2>${winner}</h2></div><div class="roster"><div class="table-head"><span class="people-label">${t('blindstop.playersLabel')}</span><span class="value">${t('room.total')}</span><span class="position">${t('room.place')}</span></div><div class="roster-scroll" tabindex="0" role="region" aria-label="${t('room.points')}">${rows}</div></div></section>`;
}
