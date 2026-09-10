import type { Json, Player } from '../engine.ts';
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
  completed: boolean;
  players: Player[];
  hostId: string | null;
  setTitle(title: string): void;
  announce(message: string): void;
  returnToRoom(): void;
  chooseGame(): void;
  registerMenu(actions: Array<{ label: string; run(): void }>, onOpen?: () => void): void;
  openDialog(title: string, body: string): void;
  localTime(serverTimestamp: number): number;
}

export type GameView = (props: GameViewProps) => void;
export interface PreparationView {
  summary(settings: Json): string;
  form(settings: Json): string;
  read(root: HTMLElement): Json | null;
  startSettings(settings: Json, practice: boolean): Json;
  rules(): string;
  practice: { title: string; body: string; action: string; skip: string };
}
export interface GameClient { default: GameView; preparation?: PreparationView; }

const views: Record<string, () => Promise<GameClient>> = {
  blindstop: () => import('../games/blindstop/view.ts'),
};
const clients = new Map<string, GameClient>();
export function loadedGameClient(gameId: string): GameClient | undefined { return clients.get(gameId); }
export async function gameClient(gameId: string): Promise<GameClient | null> { const load = views[gameId]; if (!load) return null; const client = await load(); clients.set(gameId, client); return client; }

export async function gameView(gameId: string): Promise<GameView | null> {
  const load = views[gameId];
  if (!load) return null;
  return (await gameClient(gameId))!.default;
}
