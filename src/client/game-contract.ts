import type { ComponentType, ReactNode } from 'react';
import type { GameManifest, Json, Player } from '../engine';
import type { UiActions } from './model';

export type GameMenu = Array<{ label: string; run(): void }>;

/** UI-only game extension contract. No engine or individual game owns it. */
export interface GameScreenProps {
  publicView: Json;
  privateView: Json;
  now: number;
  calibrated: boolean;
  actions: UiActions;
  scope: { gameInstanceId: string; phaseEpoch: number; roundId: string };
  playerName(playerId: string): string;
  selfId: string;
  isHost: boolean;
  canAct: boolean;
  completed: boolean;
  players: Player[];
  hostId: string | null;
  announce(message: string): void;
  returnToRoom(): void;
  chooseGame(): void;
  registerMenu(actions: GameMenu, onOpen?: () => void): void;
  localTime(serverTimestamp: number): number;
  footerRoot?: HTMLElement | null;
  openDialog(title: string, body: ReactNode): void;
}

export interface ReactGameClient {
  manifest: GameManifest;
  Screen: ComponentType<GameScreenProps>;
  Settings: ComponentType<{
    settings: Json;
    disabled: boolean;
    onChange(settings: Json | null): void;
  }>;
  Mark: ComponentType;
  rules: ReactNode;
  practice: { title: string; body: string; action: string; skip: string };
  getTitle(publicView: Json, completed: boolean): string;
  summary(settings: Json): string;
  startSettings(settings: Json, practice: boolean): Json;
}
