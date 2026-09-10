import { t } from '../i18n.ts';
export function lobbyScreen(tagline: string, code: string, count: number, roster: string): string {
  return `<div class="preparation"><div class="room-context"><span>${code} · ${t('lobby.players', { count })}</span><button class="text-action" data-action="invite">${t('room.invite')}</button></div><p class="message">${tagline}</p><div class="preparation-settings"><strong>${t('room.preparation')}</strong></div></div><div class="roster identity-only"><div class="table-head"><span class="people-label">${t('lobby.players', { count })}</span></div><div class="roster-scroll" tabindex="0" role="region" aria-label="${t('blindstop.playersLabel')}">${roster}</div></div>`;
}
