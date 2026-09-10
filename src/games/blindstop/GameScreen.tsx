'use client';

import {
  Fragment,
  useEffect,
  useRef,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import type { Json } from '../../engine.ts';
import type { GameScreenProps } from '../../client/game-contract';
import { readProjection, type Projection } from './presentation';
import { Avatar, Identity } from '../../client/react-presentation';
import { useDeadline } from '../../client/use-deadline';
import { Button } from '../../components/ui/button.tsx';
import { t } from '../../client/i18n.ts';

const privateSubmitted = (value: Json): boolean =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  value.submitted === true;
const time = (milliseconds: number): string =>
  t('time.seconds', { value: (milliseconds / 1000).toFixed(2) });

function Mark({ ring = false }: { ring?: boolean }): ReactNode {
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
      <path
        d={
          ring
            ? 'M28 16C29 23 23 29 16 29S3 23 3 16 9 3 16 3 29 9 28 16Z'
            : 'M5 17 12 24 27 7 M6 17 12 23 26 8'
        }
      />
    </svg>
  );
}
function Roster({
  props,
  state,
  mode,
}: {
  props: GameScreenProps;
  state: Projection;
  mode: 'waiting' | 'round' | 'overall' | 'final';
}): ReactNode {
  const waiting = mode === 'waiting',
    cumulative = mode === 'overall' || mode === 'final';
  const ids = waiting
    ? props.players.filter((player) => !player.departed).map((player) => player.id)
    : (cumulative ? state.standings : state.rows).map((row) => row.playerId);
  return (
    <div className="roster">
      <div className="table-head">
        <span className="people-label">
          {t('blindstop.playersHeading', { count: ids.length })}
        </span>
        <span className="value">
          {t(
            waiting
              ? 'blindstop.statusHeading'
              : cumulative
                ? 'blindstop.averageHeading'
                : 'blindstop.errorHeading',
          )}
        </span>
        <span className="position">
          {waiting
            ? ''
            : t(mode === 'final' ? 'blindstop.pointsHeading' : 'blindstop.placeHeading')}
        </span>
      </div>
      <div
        className="roster-scroll"
        tabIndex={0}
        role="region"
        aria-label={t('blindstop.playersLabel')}
      >
        {ids.map((id) => {
          const player = props.players.find((candidate) => candidate.id === id);
          if (!player) return null;
          const row = state.rows.find((candidate) => candidate.playerId === id),
            standing = state.standings.find((candidate) => candidate.playerId === id);
          const saved = state.submittedIds.includes(id),
            place = cumulative ? standing?.rank : row?.rank;
          const value = waiting ? (
            saved ? (
              <Mark />
            ) : (
              t('blindstop.counting')
            )
          ) : cumulative ? (
            standing?.meanErrorMs == null ? (
              t('blindstop.emptyValue')
            ) : (
              time(standing.meanErrorMs)
            )
          ) : row?.errorMs == null ? (
            t('blindstop.missed')
          ) : (
            time(Math.abs(row.errorMs))
          );
          const position = waiting
            ? ''
            : mode === 'final'
              ? t('blindstop.award', { count: standing?.award ?? 0 })
              : place === undefined
                ? t('blindstop.emptyValue')
                : t('blindstop.rank', { rank: place });
          const role = [
            mode === 'final' && place !== undefined
              ? t('blindstop.rank', { rank: place })
              : '',
            cumulative && standing && standing.missed > 0
              ? t('blindstop.completedTaps', {
                  count: standing.completed,
                  total: standing.completed + standing.missed,
                })
              : '',
            id === props.selfId ? t('player.you') : '',
            id === props.hostId ? t('player.host') : '',
            !player.connected ? t('player.offline') : '',
          ]
            .filter(Boolean)
            .join(' · ');
          return (
            <div
              key={id}
              className={`player ${id === props.selfId ? 'self' : ''} ${player.departed ? 'absent' : ''} ${mode === 'final' && place === 1 && (standing?.completed ?? 0) > 0 ? 'top-ranked' : ''}`}
            >
              <Avatar {...player} />
              <Identity
                player={player}
                selfId={props.selfId}
                hostId={props.hostId}
                detail={role}
              />
              <div
                className={`value ${waiting && !saved ? 'quiet' : ''}`}
                aria-label={
                  waiting
                    ? t(saved ? 'blindstop.saved' : 'blindstop.counting')
                    : undefined
                }
              >
                {value}
              </div>
              <div className="position">{position}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function winners(props: GameScreenProps, state: Projection, final: boolean): string {
  const valid = final
    ? state.standings.filter((row) => row.completed > 0)
    : state.rows.filter((row) => row.errorMs !== null);
  const best = Math.min(...valid.map((row) => row.rank)),
    leaders = valid.filter((row) => row.rank === best);
  if (!leaders.length) return t('blindstop.noWinner');
  return leaders.length > 1
    ? t(final ? 'blindstop.finalTie' : 'blindstop.roundTie', { count: leaders.length })
    : t(final ? 'blindstop.winner' : 'blindstop.roundWinner', {
        name: props.playerName(leaders[0]!.playerId),
      });
}
function Details({ items }: { items: Array<[string, string]> }): ReactNode {
  return (
    <dl className="detail-list">
      {items.map(([key, value]) => (
        <Fragment key={key}>
          <dt>{t(key)}</dt>
          <dd>{value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
function IntentButton({
  actionKey,
  label,
  disabled,
  onActivate,
  secondary = false,
}: {
  actionKey: string;
  label: string;
  disabled: boolean;
  onActivate(): void;
  secondary?: boolean;
}): ReactNode {
  const pressed = useRef<string | null>(null);
  return (
    <Button
      type="button"
      variant={secondary ? 'outline' : 'default'}
      disabled={disabled}
      onPointerDown={() => {
        pressed.current = actionKey;
      }}
      onPointerCancel={() => {
        pressed.current = null;
      }}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.repeat) event.preventDefault();
      }}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        const deliberate = event.detail === 0 || pressed.current === actionKey;
        pressed.current = null;
        if (deliberate) onActivate();
      }}
    >
      {t(label)}
    </Button>
  );
}

function Countdown({
  deadline,
  calibrated,
  announce,
}: {
  deadline: number;
  calibrated: boolean;
  announce(message: string): void;
}) {
  const seconds = useDeadline(deadline, calibrated);
  const count = Math.min(3, Math.max(1, seconds));
  useEffect(() => {
    if (calibrated) announce(t('blindstop.accessibleCountdown', { count }));
  }, [announce, calibrated, count]);
  return <span className="count-digit">{count}</span>;
}

function AutoCountdown({
  deadline,
  calibrated,
  final,
}: {
  deadline: number | null;
  calibrated: boolean;
  final: boolean;
}) {
  const count = useDeadline(deadline, calibrated);
  return <>{t(final ? 'blindstop.autoFinal' : 'blindstop.autoNext', { count })}</>;
}

export function GameScreen(props: GameScreenProps): ReactNode {
  const parsed = readProjection(props.publicView);
  const state =
    parsed && props.completed && parsed.phase === 'result'
      ? { ...parsed, phase: 'final' as const }
      : parsed;
  const latest = useRef(props);
  latest.current = props;
  const stateRef = useRef(state);
  stateRef.current = state;
  const roundKey = `${props.scope.gameInstanceId}:${props.scope.roundId}`;
  const tapState = useRef<{ roundKey: string; start: number | null; sent: boolean }>({
    roundKey: '',
    start: null,
    sent: false,
  });
  const startAt = state?.startAt;
  const { calibrated, localTime } = props;
  useEffect(() => {
    if (tapState.current.roundKey !== roundKey)
      tapState.current = { roundKey, start: null, sent: false };
    if (calibrated && startAt !== undefined && tapState.current.start === null)
      tapState.current.start = localTime(startAt);
  }, [roundKey, calibrated, localTime, startAt]);
  const phase = state?.phase,
    practice = state?.practice;
  useEffect(() => {
    const send = (type: 'NEXT' | 'START' | 'PAUSE' | 'RESUME'): void => {
      const current = latest.current;
      if (current.isHost && current.canAct)
        current.actions.send({ type: 'action', scope: current.scope, payload: { type } });
    };
    let pauseRequested = false;
    const pause = (): void => {
      const current = stateRef.current;
      if (
        !pauseRequested &&
        current?.phase === 'result' &&
        current.pace === 'auto' &&
        !current.practice &&
        !current.paused &&
        latest.current.canAct &&
        latest.current.isHost
      ) {
        pauseRequested = true;
        send('PAUSE');
      }
    };
    const actions: Array<{ label: string; run(): void }> = [];
    if (phase === 'result') {
      actions.push({
        label: t('blindstop.roundDetails'),
        run: () => {
          const current = stateRef.current;
          if (!current) return;
          pause();
          const own = current.rows.find((row) => row.playerId === latest.current.selfId);
          latest.current.openDialog(
            t('blindstop.roundDetails'),
            <Details
              items={[
                ['blindstop.targetValue', time(current.targetMs)],
                [
                  'blindstop.tapValue',
                  own?.elapsedMs == null
                    ? t('blindstop.emptyValue')
                    : time(own.elapsedMs),
                ],
                [
                  'blindstop.errorValue',
                  own?.errorMs == null
                    ? t('blindstop.missed')
                    : time(Math.abs(own.errorMs)),
                ],
                [
                  'blindstop.placeHeading',
                  own
                    ? t('blindstop.place', { rank: own.rank, total: current.total })
                    : t('blindstop.emptyValue'),
                ],
              ]}
            />,
          );
        },
      });
      if (!practice)
        actions.push({
          label: t('blindstop.overallResults'),
          run: () => {
            const current = stateRef.current;
            if (!current) return;
            pause();
            latest.current.openDialog(
              t('blindstop.overallResults'),
              <Roster props={latest.current} state={current} mode="overall" />,
            );
          },
        });
    }
    if (phase === 'final')
      actions.push({
        label: t('blindstop.yourStats'),
        run: () => {
          const current = stateRef.current;
          if (!current) return;
          const standing = current.standings.find(
            (row) => row.playerId === latest.current.selfId,
          );
          const errors = current.history.flatMap((entry) => {
            const row = entry.rows.find((row) => row.playerId === latest.current.selfId);
            return row?.errorMs == null ? [] : [Math.abs(row.errorMs)];
          });
          latest.current.openDialog(
            t('blindstop.yourStats'),
            <Details
              items={[
                [
                  'blindstop.completedValue',
                  t('blindstop.completedCount', {
                    count: standing?.completed ?? 0,
                    total: current.rounds,
                  }),
                ],
                [
                  'blindstop.averageHeading',
                  standing?.meanErrorMs == null
                    ? t('blindstop.emptyValue')
                    : time(standing.meanErrorMs),
                ],
                [
                  'blindstop.bestValue',
                  errors.length ? time(Math.min(...errors)) : t('blindstop.emptyValue'),
                ],
                [
                  'blindstop.placeHeading',
                  standing
                    ? t('blindstop.rank', { rank: standing.rank })
                    : t('blindstop.emptyValue'),
                ],
              ]}
            />,
          );
        },
      });
    latest.current.registerMenu(actions, pause);
    return () => latest.current.registerMenu([]);
  }, [phase, practice, roundKey]);
  const submitted = state
    ? privateSubmitted(props.privateView) || state.submittedIds.includes(props.selfId)
    : false;
  const announcement =
    state?.phase === 'round'
      ? t(submitted ? 'blindstop.saved' : 'blindstop.countNow')
      : '';
  useEffect(() => {
    if (announcement) latest.current.announce(announcement);
  }, [announcement]);
  if (!state) return <p className="game-error">{t('error.generic')}</p>;
  const send = (type: 'NEXT' | 'START' | 'PAUSE' | 'RESUME'): void => {
    if (props.isHost && props.canAct)
      props.actions.send({ type: 'action', scope: props.scope, payload: { type } });
  };
  let body: ReactNode,
    meta: ReactNode,
    primary: ReactNode,
    secondary: ReactNode = null;
  if (state.phase === 'countdown' || (state.phase === 'round' && !submitted)) {
    const counting = state.phase === 'countdown';
    body = (
      <section className="timing">
        <div className="timing-content">
          <p className="meta">{t('blindstop.targetLabel')}</p>
          <p className="target-number">
            {(state.targetMs / 1000).toFixed(2)} <small>{t('blindstop.unit')}</small>
          </p>
          <div className={`count-holder ${counting ? '' : 'silent'}`} aria-hidden="true">
            <Mark ring />
            {counting && (
              <Countdown
                deadline={props.localTime(state.startAt)}
                calibrated={props.calibrated}
                announce={props.announce}
              />
            )}
          </div>
          <p className={`meta ${counting ? '' : 'silent'}`}>
            {t('blindstop.countStarts')}
          </p>
        </div>
      </section>
    );
    meta = counting ? '' : t('blindstop.countSilently');
    const sendTap = (): void => {
      if (
        counting ||
        tapState.current.sent ||
        !props.canAct ||
        !props.calibrated ||
        tapState.current.start === null ||
        tapState.current.roundKey !== roundKey
      )
        return;
      tapState.current.sent = true;
      props.actions.send({
        type: 'action',
        scope: props.scope,
        payload: {
          type: 'TAP',
          elapsedMs: Math.max(0, performance.now() - tapState.current.start),
        },
      });
    };
    primary = (
      <Button
        key={`${roundKey}:tap`}
        type="button"
        className="tap"
        disabled={counting || !props.canAct || tapState.current.sent}
        onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
          if (!event.isPrimary || event.button !== 0) return;
          event.preventDefault();
          sendTap();
        }}
        onClick={sendTap}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
          if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
            event.preventDefault();
            sendTap();
          }
        }}
      >
        {t(counting ? 'blindstop.getReady' : 'blindstop.tap')}
      </Button>
    );
  } else if (state.phase === 'round') {
    body = (
      <section className="game-layout">
        <div className="focal">
          <div className="locked-mark">
            <Mark />
          </div>
          <h2>{t('blindstop.saved')}</h2>
          <p className="message">
            {t(
              state.total - state.submitted === 1
                ? 'blindstop.waitingLast'
                : state.total === state.submitted
                  ? 'blindstop.waitingNone'
                  : 'blindstop.waitingMore',
              { count: state.total - state.submitted },
            )}
          </p>
        </div>
        <Roster props={props} state={state} mode="waiting" />
      </section>
    );
    meta = t('blindstop.hidden');
    primary = (
      <div className="action-placeholder primary-slot">{t('blindstop.recorded')}</div>
    );
  } else {
    const final = state.phase === 'final',
      own = state.rows.find((row) => row.playerId === props.selfId),
      standing = state.standings.find((row) => row.playerId === props.selfId),
      error = own?.errorMs ?? null;
    body = (
      <section className="game-layout">
        <div className="focal">
          {final ? (
            <>
              <h2>
                <span className="highlight highlight-green">
                  {winners(props, state, true)}
                </span>
              </h2>
              <p className="message">
                {standing?.meanErrorMs == null
                  ? t('blindstop.noAverage')
                  : t('blindstop.yourAverage', { time: time(standing.meanErrorMs) })}
              </p>
            </>
          ) : (
            <>
              <p className="meta">{t('blindstop.yourTiming')}</p>
              {error === null ? (
                <h2>{t('blindstop.missed')}</h2>
              ) : (
                <p className="number">
                  {(Math.abs(error) / 1000).toFixed(2)}{' '}
                  <small>
                    {t('blindstop.unit')}
                    {error === 0
                      ? ''
                      : ` ${t(error < 0 ? 'blindstop.earlyLabel' : 'blindstop.lateLabel')}`}
                  </small>
                </p>
              )}
              <p className="message">{winners(props, state, false)}</p>
            </>
          )}
        </div>
        <Roster props={props} state={state} mode={final ? 'final' : 'round'} />
      </section>
    );
    const place = final
      ? standing && standing.completed > 0
        ? t('blindstop.yourPlace', { rank: standing.rank })
        : t('blindstop.noPoints')
      : own
        ? t('blindstop.place', { rank: own.rank, total: state.total })
        : '';
    const auto = !final && state.pace === 'auto' && !state.practice;
    meta = final ? (
      place
    ) : state.practice ? (
      t('blindstop.noPracticePoints')
    ) : auto ? (
      state.paused ? (
        t('blindstop.autoPaused')
      ) : (
        <AutoCountdown
          deadline={state.nextAt === null ? null : props.localTime(state.nextAt)}
          calibrated={props.calibrated}
          final={state.round === state.rounds}
        />
      )
    ) : (
      place
    );
    if (!props.isHost)
      primary = (
        <div className="action-placeholder primary-slot">
          {t('blindstop.hostDecision', { name: props.playerName(props.hostId ?? '') })}
        </div>
      );
    else if (final) {
      primary = (
        <Button
          key="again"
          type="button"
          variant="default"
          disabled={!props.canAct}
          onClick={props.returnToRoom}
        >
          {t('blindstop.again')}
        </Button>
      );
      secondary = (
        <Button
          type="button"
          variant="outline"
          disabled={!props.canAct}
          onClick={props.chooseGame}
        >
          {t('blindstop.anotherGame')}
        </Button>
      );
    } else {
      primary = (
        <IntentButton
          key={`${roundKey}:next`}
          actionKey={`${roundKey}:next`}
          label={
            state.practice
              ? 'blindstop.startGame'
              : state.round === state.rounds
                ? 'blindstop.seeFinal'
                : 'blindstop.nextRound'
          }
          disabled={!props.canAct}
          onActivate={() => send(state.practice ? 'START' : 'NEXT')}
        />
      );
      if (auto)
        secondary = (
          <Button
            type="button"
            variant="outline"
            disabled={!props.canAct}
            onClick={() => send(state.paused ? 'RESUME' : 'PAUSE')}
          >
            {t(state.paused ? 'blindstop.resumeAuto' : 'blindstop.pauseAuto')}
          </Button>
        );
    }
  }
  const footer = (
    <>
      <p className="action-meta">{meta}</p>
      {primary}
      <div className="secondary-slot">{secondary}</div>
    </>
  );
  return (
    <>
      {body}
      {props.footerRoot ? (
        createPortal(footer, props.footerRoot)
      ) : (
        <footer className="game-actions">{footer}</footer>
      )}
    </>
  );
}
export default GameScreen;
