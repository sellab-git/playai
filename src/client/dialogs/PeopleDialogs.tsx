import type { RoomState } from '../../engine';
import { Button } from '../../components/ui/button';
import { Avatar, Identity, Tick } from '../react-presentation';
import { t } from '../i18n';

export function FacePicker({
  face,
  onChange,
  onConfirm,
}: {
  face: string;
  onChange(face: string): void;
  onConfirm(): void;
}) {
  return (
    <>
      <div className="face-gallery">
        {Array.from({ length: 25 }, (_, index) => {
          const id = `face-${String(index + 1).padStart(2, '0')}`;
          return (
            <Button
              type="button"
              variant="ghost"
              key={id}
              aria-label={t('entry.faceChoice', { number: index + 1 })}
              aria-pressed={face === id}
              onClick={() => onChange(id)}
            >
              <Avatar faceId={id} tile="tYel" />
            </Button>
          );
        })}
      </div>
      <div className="dialog-actions">
        <Button type="button" onClick={onConfirm}>
          <Tick />
          {t('entry.useFace')}
        </Button>
      </div>
    </>
  );
}

export function ParticipantsDialog({
  room,
  selfId,
  enabled,
  onRemove,
}: {
  room: RoomState;
  selfId: string;
  enabled: boolean;
  onRemove(playerId: string): void;
}) {
  return (
    <div className="room-people">
      {room.players
        .filter((player) => !player.departed)
        .map((player) => (
          <div className="person-row" key={player.id}>
            <Avatar {...player} />
            <Identity player={player} selfId={selfId} hostId={room.hostId} />
            {room.hostId === selfId && player.id !== selfId && (
              <Button
                type="button"
                variant="outline"
                disabled={!enabled}
                onClick={() => onRemove(player.id)}
              >
                {t('room.remove')}
              </Button>
            )}
          </div>
        ))}
    </div>
  );
}
