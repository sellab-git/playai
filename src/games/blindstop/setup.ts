import type { Json } from '../../engine.ts';
import type { PreparationView } from '../../client/views.ts';
import { t } from '../../client/i18n.ts';

const settings = (value: Json): { rounds: number; pace: 'manual' | 'auto' } => {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return { rounds: typeof raw.rounds === 'number' ? raw.rounds : 5, pace: raw.pace === 'auto' ? 'auto' : 'manual' };
};
export const preparation: PreparationView = {
  summary: value => {
    const choice = settings(value);
    return t(choice.rounds===1?'setup.summaryOne':'setup.summary', { rounds: choice.rounds, pace: t(choice.pace === 'auto' ? 'setup.auto' : 'setup.manual') });
  },
  form: value => {
    const choice = settings(value), automatic = choice.pace === 'auto';
    return `<div class="setup-fields"><div><label class="setup-label" for="setup-rounds">${t('setup.rounds')}</label><input class="round-setting" id="setup-rounds" type="number" inputmode="numeric" min="1" max="20" step="1" value="${choice.rounds}" required aria-describedby="setup-help" /><p class="setup-help" id="setup-help">${t('setup.roundsHint')}</p></div><label class="auto-switch" for="setup-auto"><span>${t('setup.autoLabel')}</span><input class="sr-only" id="setup-auto" type="checkbox" role="switch" aria-describedby="setup-pace-help" ${automatic ? 'checked' : ''} /><strong id="setup-auto-value" aria-hidden="true">${t(automatic ? 'setup.autoOn' : 'setup.autoOff')}</strong></label><p class="setup-help" id="setup-pace-help">${t(automatic ? 'setup.autoHelp' : 'setup.manualHelp')}</p><p class="setup-help">${t('setup.saved')}</p></div>`;
  },
  read: root => {
    const rounds = root.querySelector<HTMLInputElement>('#setup-rounds')?.valueAsNumber;
    const automatic = root.querySelector<HTMLInputElement>('#setup-auto')?.checked ?? false;
    const value = root.querySelector('#setup-auto-value');
    const description = root.querySelector('#setup-pace-help');
    if (value) value.textContent = t(automatic ? 'setup.autoOn' : 'setup.autoOff');
    if (description) description.textContent = t(automatic ? 'setup.autoHelp' : 'setup.manualHelp');
    return rounds !== undefined && Number.isInteger(rounds) && rounds >= 1 && rounds <= 20 ? { rounds, pace: automatic ? 'auto' : 'manual', practice: false } : null;
  },
  startSettings: (value, practice) => ({ ...settings(value), practice }),
  rules: () => `<p>${t('blindstop.tagline')}</p><p>${t('setup.rules')}</p><p>${t('setup.scoring')}</p>`,
  practice: { title: 'setup.practiceTitle', body: 'setup.practiceBody', action: 'setup.practiceAction', skip: 'lobby.start' },
};
