export interface EntryScreenModel {
  title: string;
  createLabel: string;
  joinLabel: string;
  createSelected: boolean;
  nameLabel: string;
  name: string;
  codeField: string;
  faceLabel: string;
  faces: string;
  resume: string;
}

export function entryScreen(model: EntryScreenModel): string {
  return `<div class="entry intro"><h2>${model.title}</h2><div class="mode-switch"><button type="button" data-mode="create" aria-pressed="${model.createSelected}">${model.createLabel}</button><button type="button" data-mode="join" aria-pressed="${!model.createSelected}">${model.joinLabel}</button></div><form id="entry-form"><label for="player-name">${model.nameLabel}</label><input id="player-name" name="name" autocomplete="name" maxlength="24" value="${model.name}" required />${model.codeField}<p class="field-label">${model.faceLabel}</p><div class="faces">${model.faces}</div></form>${model.resume}</div>`;
}
