import type { RoomState } from '../engine';
import { Avatar, Identity } from './react-presentation';
import { t } from './i18n';

/** One room-wide ranking presentation, shared by the summary and its dialog. */
export function RoomStandings({ room, selfId }: { room: RoomState; selfId: string }) {
  const ordered = room.players
    .slice()
    .sort((a, b) => (room.totals[b.id] ?? 0) - (room.totals[a.id] ?? 0));
  return (
    <div className="roster">
      <div className="table-head">
        <span className="people-label">{t('room.people')}</span>
        <span className="value">{t('room.total')}</span>
        <span className="position">{t('room.place')}</span>
      </div>
      <div
        className="roster-scroll"
        tabIndex={0}
        role="region"
        aria-label={t('room.points')}
      >
        {ordered.map((player) => (
          <div className={`player ${player.id === selfId ? 'self' : ''}`} key={player.id}>
            <Avatar {...player} />
            <Identity player={player} selfId={selfId} hostId={room.hostId} />
            <span className="value">{room.totals[player.id] ?? 0}</span>
            <span className="position">
              {1 +
                ordered.filter(
                  (other) => (room.totals[other.id] ?? 0) > (room.totals[player.id] ?? 0),
                ).length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
