import { t } from '../i18n.ts';
import { icon } from '../presentation.ts';

export function lobbyScreen(tagline: string, _code: string, count: number, roster: string, summary: string, host: boolean, form: string): string {
  const settings = host
    ? `<details id="preparation-options"><summary id="settings-summary" class="settings-summary"><span>${t('room.settings')}</span><strong>${summary}</strong>${icon('M7 12 16 21 25 12')}</summary><div class="inline-settings">${form}<p class="error" id="settings-error" role="alert"></p></div></details>`
    : `<p class="meta">${summary}</p>`;
  return `<div class="preparation"><p>${tagline}</p><div class="preparation-settings">${settings}</div></div><div class="roster identity-only"><div class="table-head"><span class="people-label">${t('lobby.players', { count })}</span></div><div class="roster-scroll" tabindex="0" role="region" aria-label="${t('room.people')}">${roster}</div></div>`;
}
