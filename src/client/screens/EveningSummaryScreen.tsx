import type { RoomState } from '../../engine';
import { Button } from '../../components/ui/button';
import { RoomStandings } from '../RoomStandings';
import { t } from '../i18n';

export function EveningSummaryScreen({
  room,
  selfId,
}: {
  room: RoomState;
  selfId: string;
}) {
  const ordered = room.players
    .slice()
    .sort((a, b) => (room.totals[b.id] ?? 0) - (room.totals[a.id] ?? 0));
  const leaders = ordered.filter(
    (player) =>
      (room.totals[player.id] ?? 0) === (room.totals[ordered[0]?.id ?? ''] ?? 0),
  );
  const title = !room.gamesPlayed
    ? 'completed.body'
    : leaders.length > 1
      ? 'room.tie'
      : 'room.winner';
  return (
    <>
      <div className="focal">
        <p className="meta">{t('room.gamesPlayed', { count: room.gamesPlayed })}</p>
        <h2>
          <span className="highlight highlight-green">
            {t(title, { count: leaders.length, name: leaders[0]?.name ?? '' })}
          </span>
        </h2>
      </div>
      <RoomStandings room={room} selfId={selfId} />
    </>
  );
}

export function EveningSummaryActions({
  onFresh,
  onShare,
}: {
  onFresh(): void;
  onShare(): void;
}) {
  return (
    <div className="action-row two">
      <Button variant="outline" onClick={onFresh}>
        {t('entry.newRoom')}
      </Button>
      <Button onClick={onShare}>{t('room.share')}</Button>
    </div>
  );
}
