export interface LobbyScreenModel {
  gameName: string;
  tagline: string;
  roster: string;
  controls: string;
}

export function lobbyScreen(model: LobbyScreenModel): string {
  return `<div class="lobby"><article class="game-card"><div><h2>${model.gameName}</h2><p>${model.tagline}</p></div></article><ul class="roster">${model.roster}</ul>${model.controls}</div>`;
}
