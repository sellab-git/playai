import { isValidElement } from 'react';
import { describe, expect, it } from 'vitest';
import { gameClients, manifests } from '../src/client/react-games';
import { games } from '../src/games/registry';

describe('React game registry contract', () => {
  it('provides a React screen, settings and rules for every registered engine', () => {
    expect(Object.keys(gameClients).sort()).toEqual(Object.keys(games).sort());
    expect(Object.keys(manifests).sort()).toEqual(Object.keys(games).sort());
    for (const game of Object.values(games)) {
      const client = gameClients[game.manifest.id];
      expect(client?.Screen).toHaveProperty(
        '$$typeof',
        Symbol.for('react.lazy'),
      );
      expect(manifests[game.manifest.id]).toEqual(game.manifest);
      expect(typeof client?.Settings).toBe('function');
      expect(isValidElement(client?.rules)).toBe(true);
      expect(game.parseSettings(game.manifest.defaultSettings)).not.toBeNull();
      expect(client?.summary(game.manifest.defaultSettings)).toBeTruthy();
      expect(
        game.parseSettings(
          client!.startSettings(game.manifest.defaultSettings, false),
        ),
      ).not.toBeNull();
      expect(
        game.parseSettings(
          client!.startSettings(game.manifest.defaultSettings, true),
        ),
      ).not.toBeNull();
    }
  });
});
