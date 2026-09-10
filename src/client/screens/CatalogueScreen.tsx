import type { GameManifest } from '../../engine';
import type { ReactGameClient } from '../game-contract';
import { Button } from '../../components/ui/button';
import { Icon } from '../react-presentation';
import { t } from '../i18n';

export function CatalogueScreen({
  code,
  playerCount,
  canChoose,
  manifests,
  clients,
  onInvite,
  onChoose,
}: {
  code: string;
  playerCount: number;
  canChoose: boolean;
  manifests: Readonly<Record<string, GameManifest>>;
  clients: Readonly<Record<string, ReactGameClient>>;
  onInvite(): void;
  onChoose(manifest: GameManifest): void;
}) {
  return (
    <section className="catalogue">
      <div className="room-context">
        <span>
          {code} · {t('lobby.players', { count: playerCount })}
        </span>
        <Button variant="outline" size="sm" onClick={onInvite}>
          {t('room.invite')}
        </Button>
      </div>
      <h2>{t('room.chooseGame')}</h2>
      <div>
        {Object.values(manifests).map((manifest) => {
          const Mark = clients[manifest.id]?.Mark;
          return (
            <Button
              variant="ghost"
              className="game-card"
              key={manifest.id}
              disabled={!canChoose || !Mark}
              onClick={() => onChoose(manifest)}
            >
              <span className="ink-mark">{Mark && <Mark />}</span>
              <span>
                <strong>{t(manifest.nameKey)}</strong>
                <small>{t(manifest.taglineKey)}</small>
              </span>
              <Icon path="M11 7 21 16 11 25" />
            </Button>
          );
        })}
      </div>
    </section>
  );
}
