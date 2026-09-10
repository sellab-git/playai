import type { Json } from '../../engine';
import { t } from '../../client/i18n';

interface Row {
  playerId: string;
  elapsedMs: number | null;
  errorMs: number | null;
  rank: number;
  award: number;
}
interface Standing {
  playerId: string;
  completed: number;
  missed: number;
  meanErrorMs: number | null;
  rank: number;
  award: number;
}
interface History {
  round: number;
  targetMs: number;
  rows: Row[];
}
export interface Projection {
  targetMs: number;
  startAt: number;
  endsAt: number;
  phase: 'countdown' | 'round' | 'result' | 'final';
  submitted: number;
  submittedIds: string[];
  total: number;
  rows: Row[];
  rounds: number;
  round: number;
  practice: boolean;
  pace: 'manual' | 'auto';
  paused: boolean;
  nextAt: number | null;
  standings: Standing[];
  history: History[];
}
const object = (value: Json | undefined): Record<string, Json> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
const number = (value: Json | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;
function readRows(value: Json | undefined): Row[] | null {
  if (!Array.isArray(value)) return null;
  const rows: Row[] = [];
  for (const item of value) {
    const row = object(item);
    if (!row || typeof row.playerId !== 'string') return null;
    const rank = number(row.rank),
      award = number(row.award);
    if (rank === null || award === null) return null;
    rows.push({
      playerId: row.playerId,
      elapsedMs: number(row.elapsedMs),
      errorMs: number(row.errorMs),
      rank,
      award,
    });
  }
  return rows;
}
export function readProjection(value: Json): Projection | null {
  const raw = object(value);
  if (!raw) return null;
  const phase = raw.phase,
    targetMs = number(raw.targetMs),
    startAt = number(raw.startAt),
    endsAt = number(raw.endsAt);
  const rows = readRows(raw.rows);
  if (
    !['countdown', 'round', 'result', 'final'].includes(String(phase)) ||
    targetMs === null ||
    startAt === null ||
    endsAt === null ||
    !rows
  )
    return null;
  if (
    !Array.isArray(raw.submittedIds) ||
    !raw.submittedIds.every((id) => typeof id === 'string') ||
    !Array.isArray(raw.standings) ||
    !Array.isArray(raw.history)
  ) {
    if (raw.rounds === undefined && phase === 'result')
      return {
        targetMs,
        startAt,
        endsAt,
        phase: 'final',
        rows,
        submitted: number(raw.submitted) ?? 0,
        total: number(raw.total) ?? rows.length,
        rounds: 1,
        round: 1,
        practice: false,
        pace: 'manual',
        paused: false,
        nextAt: null,
        submittedIds: rows
          .filter((row) => row.errorMs !== null)
          .map((row) => row.playerId),
        standings: rows.map((row) => ({
          playerId: row.playerId,
          completed: row.errorMs === null ? 0 : 1,
          missed: row.errorMs === null ? 1 : 0,
          meanErrorMs: row.errorMs === null ? null : Math.abs(row.errorMs),
          rank: row.rank,
          award: row.award,
        })),
        history: [{ round: 1, targetMs, rows }],
      };
    return null;
  }
  const standings: Standing[] = [];
  for (const value of raw.standings) {
    const row = object(value);
    if (!row || typeof row.playerId !== 'string') return null;
    const completed = number(row.completed),
      missed = number(row.missed),
      rank = number(row.rank),
      award = number(row.award);
    if (completed === null || missed === null || rank === null || award === null)
      return null;
    standings.push({
      playerId: row.playerId,
      completed,
      missed,
      meanErrorMs: number(row.meanErrorMs),
      rank,
      award,
    });
  }
  const history: History[] = [];
  for (const value of raw.history) {
    const entry = object(value);
    if (!entry) return null;
    const round = number(entry.round),
      targetMs = number(entry.targetMs),
      rows = readRows(entry.rows);
    if (round === null || targetMs === null || !rows) return null;
    history.push({ round, targetMs, rows });
  }
  if (
    phase !== 'countdown' &&
    phase !== 'round' &&
    phase !== 'result' &&
    phase !== 'final'
  )
    return null;
  return {
    targetMs,
    startAt,
    endsAt,
    phase,
    rows,
    standings,
    history,
    submittedIds: raw.submittedIds,
    submitted: number(raw.submitted) ?? 0,
    total: number(raw.total) ?? 0,
    rounds: number(raw.rounds) ?? 1,
    round: number(raw.round) ?? 1,
    practice: raw.practice === true,
    pace: raw.pace === 'auto' ? 'auto' : 'manual',
    paused: raw.paused === true,
    nextAt: number(raw.nextAt),
  };
}

export function gameTitle(publicView: Json, completed: boolean): string {
  const state = readProjection(publicView);
  if (!state) return t('error.generic');
  const final = state.phase === 'final' || (completed && state.phase === 'result');
  return t(
    state.practice
      ? 'blindstop.practiceRound'
      : final
        ? 'blindstop.finalTitle'
        : state.phase === 'result'
          ? 'blindstop.resultTitle'
          : 'blindstop.roundTitle',
    { round: state.round, total: state.rounds },
  );
}
