import { t } from '../i18n.ts';
import { icon } from '../presentation.ts';

export function lobbyScreen(tagline: string, _code: string, count: number, roster: string, summary: string, host: boolean): string {
  const settings = host
    ? `<button type="button" class="settings-summary" data-action="settings" aria-label="${t('setup.editSettings')}"><span>${t('room.settings')}</span><strong>${summary}</strong>${icon('M12 7 21 16 12 25')}</button>`
    : `<p class="meta">${summary}</p>`;
  return `<div class="preparation"><p>${tagline}</p><div class="preparation-settings">${settings}</div></div><div class="roster identity-only"><div class="table-head"><span class="people-label">${t('lobby.players', { count })}</span></div><div class="roster-scroll" tabindex="0" role="region" aria-label="${t('room.people')}">${roster}</div></div>`;
}
