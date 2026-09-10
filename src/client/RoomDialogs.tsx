import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { RoomStandings } from './RoomStandings';
import { IdentityForm } from './dialogs/IdentityForm';
import { InviteDialog, ShareDialog } from './dialogs/SharingDialogs';
import { FacePicker, ParticipantsDialog } from './dialogs/PeopleDialogs';
import type { UiModel, UiActions } from './model';
import { t } from './i18n';
import { invitation, eveningText } from './sharing';
import { Icon, Tick, Door } from './react-presentation';

export type RoomDialogState =
  | { kind: 'remove'; playerId: string; title?: never; body?: never }
  | { kind: 'details'; title: string; body: ReactNode }
  | { kind: 'rules'; title?: string; body?: ReactNode }
  | {
      kind:
        | 'menu'
        | 'invite'
        | 'points'
        | 'share'
        | 'identity'
        | 'faces'
        | 'people'
        | 'abort'
        | 'leave'
        | 'close'
        | 'practice';
      title?: never;
      body?: never;
    };
export interface RoomDialogsProps {
  model: UiModel;
  actions: UiActions;
  dialog: RoomDialogState | null;
  onClose(): void;
  onNavigate(next: RoomDialogState): void;
  onStart(practice: boolean): void;
  onFaceSelected(face: string): void;
  selectedFace: string;
  gameName?: string;
  rules?: ReactNode;
  gameMenu?: Array<{ label: string; run(): void }>;
  practice?: { title: string; body: string; action: string; skip: string };
}
export function RoomDialogs(props: RoomDialogsProps) {
  return props.dialog ? <OpenDialog {...props} dialog={props.dialog} /> : null;
}
function OpenDialog({
  model,
  actions,
  dialog,
  onClose,
  onNavigate,
  onStart,
  onFaceSelected,
  selectedFace,
  gameName,
  rules,
  gameMenu = [],
  practice,
}: RoomDialogsProps & { dialog: RoomDialogState }) {
  const room = model.snapshot?.room,
    self = room?.players.find((player) => player.id === model.snapshot?.selfId);
  const host = room?.hostId === model.snapshot?.selfId,
    enabled = model.connected && model.calibrated && !model.pending;
  const [trail, setTrail] = useState<RoomDialogState[]>([]);
  const [name, setName] = useState(self?.name ?? '');
  const [face, setFace] = useState(self?.faceId ?? selectedFace);
  const [faceDraft, setFaceDraft] = useState(selectedFace);
  const [identityFaces, setIdentityFaces] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const previousKind = useRef(dialog.kind);
  useEffect(() => {
    if (previousKind.current !== dialog.kind) titleRef.current?.focus();
    previousKind.current = dialog.kind;
  }, [dialog.kind]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const go = (next: RoomDialogState) => {
    setTrail((previous) => [...previous, dialog]);
    setError('');
    setCopied(null);
    onNavigate(next);
  };
  const back = () => {
    const previous = trail.at(-1);
    if (previous) {
      setTrail(trail.slice(0, -1));
      setError('');
      setIdentityFaces(false);
      onNavigate(previous);
    } else onClose();
  };
  const action = (
    key: string,
    run: () => void,
    primary = false,
    disabled = false,
    mark?: ReactNode,
  ) => (
    <Button
      type="button"
      variant={primary ? 'default' : 'outline'}
      disabled={disabled}
      onClick={run}
    >
      {mark}
      {t(key)}
    </Button>
  );
  const copy = async (kind: 'code' | 'link' | 'results') => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(
        kind === 'code'
          ? room.code
          : kind === 'link'
            ? invitation(room.code)
            : eveningText(room),
      );
      setError('');
      setCopied(kind);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 1800);
    } catch {
      setError(t(kind === 'results' ? 'room.shareFallback' : 'room.copyFallback'));
    }
  };
  const titles: Record<RoomDialogState['kind'], string> = {
    menu: 'nav.menu',
    details: 'room.details',
    invite: 'room.invite',
    rules: 'room.rules',
    points: 'room.points',
    share: 'room.share',
    identity: 'room.identity',
    faces: 'entry.face',
    people: 'room.people',
    remove: 'room.removeTitle',
    abort: 'confirm.abort.title',
    leave: 'confirm.leave.title',
    close: 'confirm.close.title',
    practice: practice?.title ?? 'setup.practiceTitle',
  };
  const title =
    dialog.title ??
    (dialog.kind === 'rules' && gameName
      ? t('room.gameRules', { game: gameName })
      : t(titles[dialog.kind] ?? 'room.details'));
  let body: ReactNode = dialog.body;
  if (dialog.kind === 'menu')
    body = (
      <div className="dialog-actions">
        {gameMenu.map((item, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            onClick={() => {
              setTrail((previous) => [...previous, dialog]);
              setError('');
              setCopied(null);
              item.run();
            }}
          >
            {item.label}
          </Button>
        ))}
        {action('room.rules', () => go({ kind: 'rules' }))}
        {room?.status === 'lobby' && (
          <>
            {action('room.invite', () => go({ kind: 'invite' }))}
            {action('room.people', () => go({ kind: 'people' }))}
            {action('room.identity', () => go({ kind: 'identity' }))}
            {action('room.points', () => go({ kind: 'points' }))}
          </>
        )}
        {host ? (
          <>
            {room?.status === 'playing' &&
              action('lobby.abort', () => go({ kind: 'abort' }), false, !enabled)}
            {room?.status === 'lobby' &&
              action(
                'lobby.close',
                () => go({ kind: 'close' }),
                false,
                !enabled,
                <Door />,
              )}
          </>
        ) : (
          action('lobby.leave', () => go({ kind: 'leave' }), false, !enabled, <Door />)
        )}
      </div>
    );
  if (dialog.kind === 'invite' && room)
    body = (
      <InviteDialog code={room.code} copied={copied} onCopy={(kind) => void copy(kind)} />
    );
  if (dialog.kind === 'rules') body = dialog.body ?? rules;
  if (dialog.kind === 'points' && room && model.snapshot) {
    const ordered = room.players
      .slice()
      .sort((a, b) => (room.totals[b.id] ?? 0) - (room.totals[a.id] ?? 0));
    const best = ordered.length ? (room.totals[ordered[0]!.id] ?? 0) : 0;
    const leaders = ordered.filter((player) => (room.totals[player.id] ?? 0) === best);
    const winner = !room.gamesPlayed
      ? t('room.noGames')
      : leaders.length > 1
        ? t('room.tie', { count: leaders.length })
        : t('room.winner', { name: leaders[0]?.name ?? '' });
    body = (
      <>
        <div className="focal">
          <p className="meta">{t('room.gamesPlayed', { count: room.gamesPlayed })}</p>
          <h2>
            <span className="highlight highlight-green">{winner}</span>
          </h2>
        </div>
        <RoomStandings room={room} selfId={model.snapshot.selfId} />
        <div className="dialog-actions">
          {action('room.share', () => go({ kind: 'share' }))}
        </div>
      </>
    );
  }
  if (dialog.kind === 'share' && room)
    body = (
      <ShareDialog
        text={eveningText(room)}
        copied={copied === 'results'}
        onCopy={() => void copy('results')}
        onShare={
          typeof navigator !== 'undefined' && typeof navigator.share === 'function'
            ? () => {
                void navigator
                  .share({ text: eveningText(room) })
                  .catch((reason: unknown) => {
                    if (!(reason instanceof DOMException && reason.name === 'AbortError'))
                      setError(t('room.shareFallback'));
                  });
              }
            : undefined
        }
      />
    );
  if (dialog.kind === 'identity')
    body = (
      <IdentityForm
        name={name}
        face={face}
        tile={self?.tile ?? 'tYel'}
        error={error}
        disabled={!enabled}
        onNameChange={(next) => {
          setName(next);
          setError('');
        }}
        onChooseFace={() => {
          setFaceDraft(face);
          setIdentityFaces(true);
          go({ kind: 'faces' });
        }}
        onSave={() => {
          if (!name.trim()) {
            setError(t('join.invalid'));
            return;
          }
          if (enabled && room?.status === 'lobby') {
            actions.send({
              type: 'profile',
              profile: { name: name.trim(), faceId: face },
            });
            onClose();
          }
        }}
      />
    );
  if (dialog.kind === 'faces')
    body = (
      <FacePicker
        face={faceDraft}
        onChange={setFaceDraft}
        onConfirm={() => {
          if (identityFaces) {
            setFace(faceDraft);
            back();
          } else {
            onFaceSelected(faceDraft);
            onClose();
          }
        }}
      />
    );
  if (dialog.kind === 'people' && room && model.snapshot)
    body = (
      <ParticipantsDialog
        room={room}
        selfId={model.snapshot.selfId}
        enabled={enabled}
        onRemove={(playerId) => go({ kind: 'remove', playerId })}
      />
    );
  if (dialog.kind === 'remove')
    body = (
      <>
        <p>
          {t('room.removeBody', {
            name:
              room?.players.find((player) => player.id === dialog.playerId)?.name ?? '',
          })}
        </p>
        <div className="dialog-actions">
          {action(
            'room.remove',
            () => {
              if (enabled && dialog.playerId) {
                actions.send({ type: 'kick', playerId: dialog.playerId });
                onClose();
              }
            },
            true,
            !enabled,
          )}
        </div>
      </>
    );
  if (dialog.kind === 'abort' || dialog.kind === 'leave' || dialog.kind === 'close') {
    const kind = dialog.kind;
    body = (
      <>
        <p>{t(`confirm.${kind}.body`)}</p>
        <div className="dialog-actions">
          {action(
            'confirm.confirm',
            () => {
              if (enabled) {
                actions.send({ type: kind });
                onClose();
              }
            },
            true,
            !enabled,
            <Tick />,
          )}
        </div>
      </>
    );
  }
  if (dialog.kind === 'practice')
    body = (
      <>
        <p>{t(practice?.body ?? 'setup.practiceBody')}</p>
        <div className="dialog-actions">
          {action(
            practice?.action ?? 'setup.practiceAction',
            () => {
              onClose();
              onStart(true);
            },
            true,
            !enabled,
          )}
          {action(
            practice?.skip ?? 'lobby.start',
            () => {
              onClose();
              onStart(false);
            },
            false,
            !enabled,
          )}
        </div>
      </>
    );
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent showCloseButton={false} aria-describedby={undefined}>
        <div className="dialog-head">
          {trail.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t('nav.back')}
              onClick={back}
            >
              <Icon path="M21 7 11 16 21 25" />
            </Button>
          )}
          <DialogTitle ref={titleRef} tabIndex={-1} id="dialog-title">
            {title}
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t('nav.close')}
            onClick={onClose}
          >
            <Icon path="M7 7 25 25 M25 7 7 25" />
          </Button>
        </div>
        <div className="dialog-body">{body}</div>
        {((error && dialog.kind !== 'identity') || model.error) && (
          <p className="error" role="alert">
            {error || t(model.error!)}
          </p>
        )}
        <p
          className="copy-status"
          role="status"
          hidden={!['invite', 'share'].includes(dialog.kind)}
        >
          {copied
            ? t(
                copied === 'code'
                  ? 'room.codeCopied'
                  : copied === 'link'
                    ? 'room.linkCopied'
                    : 'room.resultsCopied',
              )
            : ''}
        </p>
      </DialogContent>
    </Dialog>
  );
}
