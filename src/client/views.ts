import type { Json } from '../engine.ts';
import type { UiActions } from './ui.ts';

export interface GameViewProps {
  root: HTMLElement;
  footerRoot: HTMLElement;
  publicView: Json;
  privateView: Json;
  now: number;
  actions: UiActions;
  scope: { gameInstanceId: string; phaseEpoch: number; roundId: string };
  playerName: (playerId: string) => string;
  selfId: string;
  isHost: boolean;
  canAct: boolean;
  localTime(serverTimestamp: number): number;
}

export type GameView = (props: GameViewProps) => void;

const views: Record<string, () => Promise<{ default: GameView }>> = {
  blindstop: () => import('../games/blindstop/view.ts'),
};

export async function gameView(gameId: string): Promise<GameView | null> {
  const load = views[gameId];
  if (!load) return null;
  return (await load()).default;
}
