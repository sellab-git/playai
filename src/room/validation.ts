import type { Command, Intent, Json } from '../engine';

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const exact = (value: Record<string, unknown>, keys: readonly string[]) => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));

export function isJson(value: unknown): value is Json {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJson);
  return object(value) && Object.values(value).every(isJson);
}

function canonical(value: Json): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key]!)}`).join(',')}}`;
}
export function canonicalJson(value: unknown): string {
  if (!isJson(value)) throw new Error('Value is not JSON');
  return canonical(value);
}

export function parseIntent(raw: unknown): Intent | null {
  if (!object(raw) || !exact(raw, ['actionId', 'command']) || typeof raw.actionId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(raw.actionId) || !object(raw.command)) return null;
  const command = raw.command;
  let parsed: Command | null = null;
  if (command.type === 'lobby' && exact(command, ['type', 'destination']) && (command.destination === 'catalogue' || command.destination === 'preparation')) return { actionId: raw.actionId, command: { type: 'lobby', destination: command.destination } };
  if (command.type === 'configure' && exact(command, ['type', 'setup']) && (command.setup === null || object(command.setup) && exact(command.setup, ['gameId', 'settings']) && typeof command.setup.gameId === 'string' && isJson(command.setup.settings))) return { actionId: raw.actionId, command: { type: 'configure', setup: command.setup === null ? null : { gameId: command.setup.gameId as string, settings: command.setup.settings as Json } } };
  if (command.type === 'profile' && exact(command, ['type', 'profile']) && object(command.profile) && exact(command.profile, ['name', 'faceId']) && typeof command.profile.name === 'string' && typeof command.profile.faceId === 'string') return { actionId: raw.actionId, command: { type: 'profile', profile: { name: command.profile.name, faceId: command.profile.faceId } } };
  if (command.type === 'start' && exact(command, ['type', 'gameId', 'settings']) && typeof command.gameId === 'string' && isJson(command.settings)) parsed = { type: 'start', gameId: command.gameId, settings: command.settings };
  else if (command.type === 'action' && exact(command, ['type', 'scope', 'payload']) && object(command.scope) && exact(command.scope, ['gameInstanceId', 'phaseEpoch', 'roundId']) && typeof command.scope.gameInstanceId === 'string'
    && Number.isSafeInteger(command.scope.phaseEpoch) && typeof command.scope.roundId === 'string' && isJson(command.payload)) {
    parsed = { type: 'action', scope: { gameInstanceId: command.scope.gameInstanceId, phaseEpoch: command.scope.phaseEpoch as number, roundId: command.scope.roundId }, payload: command.payload };
  } else if (command.type === 'kick' && exact(command, ['type', 'playerId']) && typeof command.playerId === 'string') parsed = { type: 'kick', playerId: command.playerId };
  else if ((command.type === 'abort' || command.type === 'lobby' || command.type === 'leave' || command.type === 'close') && exact(command, ['type'])) parsed = { type: command.type };
  return parsed === null ? null : { actionId: raw.actionId, command: parsed };
}

export function validProfile(raw: unknown): raw is { name: string; faceId: string; tile: string } {
  if (!object(raw)) return false;
  const hasControl = typeof raw.name === 'string' && [...raw.name].some(character => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });
  // A small explicit launch filter, not a claim of comprehensive name moderation.
  // NFKC/lowercase whitespace tokens avoid substring false positives such as Scunthorpe.
  const blocked = new Set(['asshole', 'bitch', 'cunt', 'fuck', 'fucker', 'shit']);
  const hasBlockedToken = typeof raw.name === 'string' && raw.name.normalize('NFKC').toLowerCase().trim().split(/\s+/u).some(token => blocked.has(token));
  return exact(raw, ['name', 'faceId', 'tile']) && typeof raw.name === 'string' && raw.name.trim().length >= 1 && raw.name.trim().length <= 24
    && !hasControl && raw.name !== '__proto__' && raw.name !== 'constructor'
    && !hasBlockedToken
    && typeof raw.faceId === 'string' && /^face-(0[1-9]|1\d|2[0-5])$/.test(raw.faceId)
    && typeof raw.tile === 'string' && /^(tYel|tRed|tBlu|tGrn|tPur|tOrg|tPnk|tGry)$/.test(raw.tile);
}
