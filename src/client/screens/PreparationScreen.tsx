import type { GameManifest, Json, Player } from '../../engine';
import type { ReactGameClient } from '../game-contract';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '../../components/ui/collapsible';
import { Button } from '../../components/ui/button';
import { Avatar, Identity, Icon } from '../react-presentation';
import { t } from '../i18n';

export interface PreparationProps {
  manifest: GameManifest;
  client?: ReactGameClient;
  settings: Json;
  settingsContext: string;
  players: Player[];
  selfId: string;
  hostId: string | null;
  isHost: boolean;
  enabled: boolean;
  canStart: boolean;
  onChange(settings: Json | null): void;
  onStart(): void;
}

export function PreparationScreen(props: PreparationProps) {
  const {
    manifest,
    client,
    settings,
    settingsContext,
    players,
    selfId,
    hostId,
    isHost,
    enabled,
  } = props;
  return (
    <>
      <div className="preparation">
        <p>{t(manifest.taglineKey)}</p>
        <div className="preparation-settings">
          {isHost && client ? (
            <Collapsible key={settingsContext} id="preparation-options">
              <CollapsibleTrigger className="settings-summary">
                <span>{t('room.settings')}</span>
                <strong>{client.summary(settings)}</strong>
                <Icon path="M7 12 16 21 25 12" />
              </CollapsibleTrigger>
              <CollapsibleContent keepMounted className="inline-settings">
                <client.Settings
                  settings={settings}
                  disabled={!enabled}
                  onChange={props.onChange}
                />
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <p className="meta">{client?.summary(settings)}</p>
          )}
        </div>
      </div>
      <div className="roster identity-only">
        <div className="table-head">
          <span className="people-label">
            {t('lobby.players', { count: players.length })}
          </span>
        </div>
        <div
          className="roster-scroll"
          tabIndex={0}
          role="region"
          aria-label={t('room.people')}
        >
          {players.map((player) => (
            <div
              className={`player ${player.id === selfId ? 'self' : ''}`}
              key={player.id}
            >
              <Avatar {...player} />
              <Identity player={player} selfId={selfId} hostId={hostId} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function PreparationActions(props: PreparationProps) {
  if (!props.isHost) {
    return (
      <p className="action-meta">
        {t('lobby.waiting', {
          name: props.players.find((player) => player.id === props.hostId)?.name ?? '',
        })}
      </p>
    );
  }
  return (
    <Button disabled={!props.canStart} onClick={props.onStart}>
      {t(
        props.players.length === 1 && props.manifest.minPlayers === 1
          ? 'lobby.startSolo'
          : 'lobby.start',
      )}
    </Button>
  );
}
