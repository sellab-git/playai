'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createRoomClient } from './room-client';
import { RoomDialogs, type RoomDialogState } from './RoomDialogs';
import { gameClients, defaultGame, manifests } from './react-games';
import { t } from './i18n';
import { EntryScreen, EntryActions, type EntryProps } from './screens/EntryScreen';
import { CatalogueScreen } from './screens/CatalogueScreen';
import {
  PreparationScreen,
  PreparationActions,
  type PreparationProps,
} from './screens/PreparationScreen';
import {
  EveningSummaryScreen,
  EveningSummaryActions,
} from './screens/EveningSummaryScreen';
import { RoomShell } from './screens/RoomShell';
import type { Json } from '../engine';
import type { UiModel, UiActions } from './model';

type GameMenu = Array<{ label: string; run(): void }>;

export default function App() {
  const [client] = useState(createRoomClient);
  const model = useSyncExternalStore(
    client.subscribe,
    client.getSnapshot,
    client.getSnapshot,
  );
  useEffect(() => {
    client.start();
    return () => client.dispose();
  }, [client]);
  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () =>
      document.documentElement.style.setProperty(
        '--viewport-height',
        `${viewport?.height ?? window.innerHeight}px`,
      );
    resize();
    viewport?.addEventListener('resize', resize);
    window.addEventListener('resize', resize);
    return () => {
      viewport?.removeEventListener('resize', resize);
      window.removeEventListener('resize', resize);
      document.documentElement.style.removeProperty('--viewport-height');
    };
  }, []);
  return <RoomApp model={model} actions={client.actions} />;
}

/** Server snapshots reconcile children within a stable shell. */
export function RoomApp({ model, actions }: { model: UiModel; actions: UiActions }) {
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [face, setFace] = useState('face-01');
  const [dialogState, setDialogState] = useState<{
    context: string;
    value: RoomDialogState;
  } | null>(null);
  const [announcement, announce] = useState('');
  const [gameMenu, setGameMenu] = useState<GameMenu>([]);
  const onMenuOpen = useRef<(() => void) | undefined>(undefined);
  const [footerRoot, setFooterRoot] = useState<HTMLDivElement | null>(null);
  const [invalidSettings, setInvalidSettings] = useState<string | null>(null);
  const snapshot = model.snapshot,
    room = snapshot?.room,
    game = snapshot?.game;
  const isHost = !!snapshot && room?.hostId === snapshot.selfId;
  const enabled = model.connected && model.calibrated && !model.pending;
  const selectedId = game?.gameId ?? room?.setup?.gameId ?? defaultGame.id;
  const manifest = manifests[selectedId] ?? defaultGame;
  const client = gameClients[selectedId];
  const settings =
    model.settingsDraft?.gameId === selectedId
      ? model.settingsDraft.settings
      : (room?.setup?.settings ?? manifest.defaultSettings);
  const settingsContext = `${room?.code}:${room?.setup?.gameId}`;
  const context = `${room?.code}:${room?.status}:${room?.hostId}:${game?.scope.gameInstanceId}:${game?.phase.name}:${game?.scope.roundId}:${model.connected}`;
  useEffect(() => {
    setDialogState(null);
  }, [context]);
  useEffect(() => {
    setInvalidSettings(null);
  }, [settingsContext]);
  const hasSession = !!snapshot;
  useEffect(() => {
    if (hasSession) setMode('home');
  }, [hasSession]);
  const dialog = dialogState?.context === context ? dialogState.value : null;
  const openDialog = useCallback(
    (value: RoomDialogState) => setDialogState({ context, value }),
    [context],
  );
  const closeDialog = useCallback(() => setDialogState(null), []);
  const registerMenu = useCallback((items: GameMenu, onOpen?: () => void) => {
    setGameMenu(items);
    onMenuOpen.current = onOpen;
  }, []);
  const openDetails = useCallback(
    (title: string, body: ReactNode) => openDialog({ kind: 'details', title, body }),
    [openDialog],
  );
  const returnToRoom = useCallback(
    () => actions.send({ type: 'lobby', destination: 'preparation' }),
    [actions],
  );
  const chooseGame = useCallback(
    () => actions.send({ type: 'lobby', destination: 'catalogue' }),
    [actions],
  );
  const activeGame =
    !!room && room.status !== 'lobby' && room.status !== 'closed' && !!game;
  const players = room?.players.filter((player) => !player.departed) ?? [];
  const canStart =
    enabled &&
    invalidSettings !== settingsContext &&
    !!client &&
    players.filter((player) => player.connected).length >= manifest.minPlayers;
  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get('code');
    if (query && /^[A-HJ-NP-Z2-9]{5}$/.test(query)) {
      setCode(query);
      setMode('join');
    }
  }, []);
  const fresh = () => {
    setMode('create');
    closeDialog();
    actions.fresh();
  };
  const start = (practice: boolean) => {
    if (isHost && canStart && client)
      actions.send({
        type: 'start',
        gameId: selectedId,
        settings: client.startSettings(settings, practice),
      });
  };
  const changeSettings = (next: Json | null) => {
    setInvalidSettings(next === null ? settingsContext : null);
    if (next !== null && isHost && enabled)
      actions.send({
        type: 'configure',
        setup: { gameId: selectedId, settings: next },
      });
  };
  const title =
    room?.status === 'closed'
      ? t('room.evening')
      : activeGame && game && client
        ? client.getTitle(game.public, room?.status === 'completed')
        : room?.setup
          ? t(manifest.nameKey)
          : t('app.title');
  const status =
    snapshot && !model.connected
      ? t('connection.reconnecting')
      : model.delivery && model.delivery !== 'delivery.saved'
        ? t(model.delivery)
        : '';
  const back =
    (room?.status === 'lobby' && room.setup && isHost) || (!snapshot && mode !== 'home');
  let body: ReactNode, footer: ReactNode;
  if (!snapshot) {
    const props: EntryProps = {
      mode,
      name,
      code,
      face,
      savedRoomCode: model.savedRoomCode,
      pending: model.admissionPending ?? false,
      onMode: setMode,
      onName: setName,
      onCode: setCode,
      onFace: () => openDialog({ kind: 'faces' }),
      onFresh: fresh,
      onResume: actions.resume,
      onSubmit: () => {
        if (mode === 'create') actions.create(name.trim(), face);
        else actions.join(code.trim().toUpperCase(), name.trim(), face);
      },
    };
    body = <EntryScreen {...props} />;
    footer = <EntryActions {...props} />;
  } else if (snapshot.room.status === 'closed') {
    body = <EveningSummaryScreen room={snapshot.room} selfId={snapshot.selfId} />;
    footer = (
      <EveningSummaryActions
        onFresh={fresh}
        onShare={() => openDialog({ kind: 'share' })}
      />
    );
  } else if (!activeGame) {
    const currentRoom = snapshot.room;
    if (!currentRoom.setup) {
      body = (
        <CatalogueScreen
          code={currentRoom.code}
          playerCount={players.length}
          canChoose={isHost && enabled}
          manifests={manifests}
          clients={gameClients}
          onInvite={() => openDialog({ kind: 'invite' })}
          onChoose={(item) =>
            actions.send({
              type: 'configure',
              setup: { gameId: item.id, settings: item.defaultSettings },
            })
          }
        />
      );
      footer = isHost ? null : (
        <p className="action-meta">{t('room.waitingSelection')}</p>
      );
    } else {
      const props: PreparationProps = {
        manifest,
        client,
        settings,
        settingsContext,
        players,
        selfId: snapshot.selfId,
        hostId: currentRoom.hostId,
        isHost,
        enabled,
        canStart,
        onChange: changeSettings,
        onStart: () => {
          if (!(currentRoom.gamesStarted ?? currentRoom.gamesPlayed))
            openDialog({ kind: 'practice' });
          else start(false);
        },
      };
      body = <PreparationScreen {...props} />;
      footer = <PreparationActions {...props} />;
    }
  } else if (client && game) {
    const currentRoom = snapshot.room;
    body = (
      <div id="game-view">
        <Suspense fallback={null}>
          <client.Screen
            key={game.scope.gameInstanceId}
            publicView={game.public}
            privateView={game.private}
            now={model.now}
            calibrated={model.calibrated}
            actions={actions}
            scope={game.scope}
            playerName={(id) =>
              currentRoom.players.find((player) => player.id === id)?.name ?? ''
            }
            selfId={snapshot.selfId}
            isHost={isHost}
            canAct={enabled}
            completed={currentRoom.status === 'completed'}
            players={currentRoom.players}
            hostId={currentRoom.hostId}
            announce={announce}
            returnToRoom={returnToRoom}
            chooseGame={chooseGame}
            registerMenu={registerMenu}
            openDialog={openDetails}
            localTime={model.serverToLocal}
            footerRoot={footerRoot}
          />
        </Suspense>
      </div>
    );
  } else {
    body = <p role="alert">{t('error.generic')}</p>;
  }
  return (
    <div id="app">
      <RoomShell
        title={title}
        status={status}
        error={model.error ? t(model.error) : ''}
        warning={model.persistenceWarning ? t(model.persistenceWarning) : ''}
        backDisabled={!!snapshot && !enabled}
        footerRef={setFooterRoot}
        footer={footer}
        onBack={
          back
            ? () => {
                if (snapshot) actions.send({ type: 'configure', setup: null });
                else setMode('home');
              }
            : undefined
        }
        onMenu={
          snapshot && snapshot.room.status !== 'closed'
            ? () => {
                if (activeGame) onMenuOpen.current?.();
                openDialog({ kind: 'menu' });
              }
            : undefined
        }
      >
        {body}
      </RoomShell>
      <RoomDialogs
        key={context}
        model={model}
        actions={actions}
        dialog={dialog}
        onClose={closeDialog}
        onNavigate={openDialog}
        onStart={start}
        onFaceSelected={setFace}
        selectedFace={face}
        gameName={t(manifest.nameKey)}
        rules={client?.rules}
        gameMenu={activeGame ? gameMenu : []}
        practice={client?.practice}
      />
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
