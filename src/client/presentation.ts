import type { Player } from '../engine.ts';
import { t } from './i18n.ts';

export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c] ?? c);
export function avatar(player: Pick<Player, 'faceId' | 'tile'>): string {
  const face = /^face-(0[1-9]|1[0-9]|2[0-5])$/.test(player.faceId) ? player.faceId : 'face-01';
  const tile = ['tYel', 'tRed', 'tBlu', 'tGrn', 'tPur', 'tOrg', 'tPnk', 'tGry'].includes(player.tile) ? player.tile : 'tYel';
  return `<span class="avatar tile-${tile}" aria-hidden="true"><img src="/assets/avatars/${face}.svg" alt="" /></span>`;
}
export const icon = (path: string): string => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}" /></svg>`;
export const tick = (): string => icon('M5 17 12 24 27 7 M6 17 12 23 26 8');
export const ring = (): string => icon('M28 16C29 23 23 29 16 29S3 23 3 16 9 3 16 3 29 9 28 16Z');
export const button = (labelKey: string, action: string, kind = 'primary', disabled = false): string => `<button type="button" class="button ${kind}" data-action="${action}" ${disabled ? 'disabled' : ''}>${['save-identity','save-face','confirm'].includes(action)?tick():['leave','close'].includes(action)?door():''}${t(labelKey)}</button>`;
export function playerIdentity(player: Player, selfId: string, hostId: string | null): string {
  const role = [player.id === selfId ? t('player.you') : '', player.id === hostId ? t('player.host') : '', !player.connected ? t('player.offline') : ''].filter(Boolean).join(' · ');
  return `<div class="identity identity-${player.tile}"><div class="name"><span>${escapeHtml(player.name)}</span></div><div class="role">${role}</div></div>`;
}

export const door = (): string => icon('M6 28V4H23V28 M3 28H28 M12 5V27 M18 17H19');
export const clock = (): string => icon('M16 3C8 3 3 9 3 16S9 29 16 29 29 23 29 16 24 3 16 3 M16 8V17L22 20');
