import type { Player } from '../engine';
import { t } from './i18n';
export function Avatar({ faceId, tile }: Pick<Player, 'faceId' | 'tile'>) {
  const face = /^face-(0[1-9]|1[0-9]|2[0-5])$/.test(faceId) ? faceId : 'face-01';
  const tint = ['tYel', 'tRed', 'tBlu', 'tGrn', 'tPur', 'tOrg', 'tPnk', 'tGry'].includes(
    tile,
  )
    ? tile
    : 'tYel';
  return (
    <span className={`avatar tile-${tint}`} aria-hidden="true">
      <img src={`/assets/avatars/${face}.svg`} alt="" />
    </span>
  );
}
export function Identity({
  player,
  selfId,
  hostId,
  detail,
}: {
  player: Player;
  selfId: string;
  hostId: string | null;
  detail?: string;
}) {
  const role =
    detail ??
    [
      player.id === selfId ? t('player.you') : '',
      player.id === hostId ? t('player.host') : '',
      !player.connected ? t('player.offline') : '',
    ]
      .filter(Boolean)
      .join(' · ');
  return (
    <div className={`identity identity-${player.tile}`}>
      <div className="name">
        <span>{player.name}</span>
      </div>
      <div className="role">{role}</div>
    </div>
  );
}
export function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
export function Tick() {
  return <Icon path="M5 17 12 24 27 7 M6 17 12 23 26 8" />;
}
export function Clock() {
  return (
    <Icon path="M16 3C8 3 3 9 3 16S9 29 16 29 29 23 29 16 24 3 16 3 M16 8V17L22 20" />
  );
}
export function Door() {
  return <Icon path="M6 28V4H23V28 M3 28H28 M12 5V27 M18 17H19" />;
}
