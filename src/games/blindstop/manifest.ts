import type { GameManifest } from '../../engine';

export const blindstopManifest = {
  id: 'blindstop',
  nameKey: 'blindstop.name',
  taglineKey: 'blindstop.tagline',
  markId: 'stopwatch',
  minPlayers: 1,
  maxPlayers: 20,
  estimatedMinutes: [2, 8],
  defaultSettings: {
    rounds: 5,
    pace: 'manual' as const,
    practice: false,
    legacy: false,
  },
  awardPolicy: 'ranked',
} satisfies GameManifest;
