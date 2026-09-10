import { lazy } from 'react';
import type { ReactGameClient } from './game-contract';
import { Clock } from './react-presentation';
import { gameTitle } from '../games/blindstop/presentation';
import { blindstopManifest } from '../games/blindstop/manifest';
import { Settings } from '../games/blindstop/Settings';
import {
  Rules,
  practice,
  settingsSummary,
  startSettings,
} from '../games/blindstop/Preparation';

// The only frontend registry; the contract test binds it to engine manifests.
export const gameClients: Record<string, ReactGameClient> = {
  blindstop: {
    manifest: blindstopManifest,
    Screen: lazy(() =>
      import('../games/blindstop/GameScreen').then((module) => ({
        default: module.GameScreen,
      })),
    ),
    Settings,
    Mark: Clock,
    rules: <Rules />,
    practice,
    getTitle: gameTitle,
    summary: settingsSummary,
    startSettings,
  },
};

export const defaultGame = gameClients.blindstop.manifest;
export const manifests = Object.fromEntries(
  Object.entries(gameClients).map(([id, client]) => [id, client.manifest]),
);
