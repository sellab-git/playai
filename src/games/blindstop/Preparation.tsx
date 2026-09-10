'use client';

import type { Json } from '../../engine.ts';
import { t } from '../../client/i18n.ts';
import { Input } from '../../components/ui/input.tsx';
import { Switch } from '../../components/ui/switch.tsx';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '../../components/ui/field.tsx';
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group.tsx';

export interface PreparationValue {
  rounds: string;
  pace: 'manual' | 'auto';
}
export const defaultSettings: PreparationValue = { rounds: '5', pace: 'manual' };
export function settingsDraft(value: Json): PreparationValue {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    rounds: String(typeof raw.rounds === 'number' ? raw.rounds : 5),
    pace: raw.pace === 'auto' ? 'auto' : 'manual',
  };
}
export function parseSettings(value: PreparationValue): Json | null {
  const rounds = Number(value.rounds);
  return value.rounds.trim() !== '' &&
    Number.isInteger(rounds) &&
    rounds >= 1 &&
    rounds <= 20
    ? { rounds, pace: value.pace, practice: false }
    : null;
}
export function startSettings(value: Json, practice: boolean): Json {
  const draft = settingsDraft(value);
  return { rounds: Number(draft.rounds), pace: draft.pace, practice };
}
export function settingsSummary(value: Json): string {
  const draft = settingsDraft(value),
    rounds = Number(draft.rounds);
  return t(rounds === 1 ? 'setup.summaryOne' : 'setup.summary', {
    rounds,
    pace: t(draft.pace === 'auto' ? 'setup.auto' : 'setup.manual'),
  });
}
export function Rules() {
  return (
    <>
      <p>{t('blindstop.tagline')}</p>
      <p>{t('setup.rules')}</p>
      <p>{t('setup.scoring')}</p>
    </>
  );
}
export interface PreparationProps {
  value: PreparationValue;
  onChange(value: PreparationValue): void;
  disabled?: boolean;
  error?: string;
}
export function Preparation({
  value,
  onChange,
  disabled = false,
  error,
}: PreparationProps) {
  const automatic = value.pace === 'auto';
  return (
    <FieldGroup className="setup-fields">
      <Field data-invalid={Boolean(error)} data-disabled={disabled}>
        <FieldLabel className="setup-label" htmlFor="setup-rounds">
          {t('setup.rounds')}
        </FieldLabel>
        <Input
          className="round-setting"
          id="setup-rounds"
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          step={1}
          value={value.rounds}
          required
          aria-describedby={error ? 'setup-help settings-error' : 'setup-help'}
          aria-invalid={Boolean(error)}
          disabled={disabled}
          onChange={(event) => onChange({ ...value, rounds: event.target.value })}
        />
        <ToggleGroup
          className="round-presets"
          variant="outline"
          value={[value.rounds]}
          disabled={disabled}
          aria-label={t('setup.presets')}
          onValueChange={(selected) => {
            if (selected[0] !== undefined)
              onChange({ ...value, rounds: String(selected[0]) });
          }}
        >
          {[3, 5, 10, 15, 20].map((rounds) => (
            <ToggleGroupItem
              key={rounds}
              value={String(rounds)}
              id={`round-preset-${rounds}`}
              data-round-preset={rounds}
            >
              {t('setup.preset', { count: rounds })}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldDescription className="setup-help" id="setup-help">
          {t('setup.roundsHint')}
        </FieldDescription>
        {error && (
          <FieldError className="error" id="settings-error">
            {error}
          </FieldError>
        )}
      </Field>
      <Field orientation="horizontal" className="auto-switch" data-disabled={disabled}>
        <FieldLabel htmlFor="setup-auto">{t('setup.autoLabel')}</FieldLabel>
        <Switch
          id="setup-auto"
          aria-describedby="setup-pace-help"
          checked={automatic}
          disabled={disabled}
          onCheckedChange={(checked) =>
            onChange({ ...value, pace: checked ? 'auto' : 'manual' })
          }
        />
        <strong id="setup-auto-value" aria-hidden="true">
          {t(automatic ? 'setup.autoOn' : 'setup.autoOff')}
        </strong>
      </Field>
      <FieldDescription className="setup-help" id="setup-pace-help">
        {t(automatic ? 'setup.autoHelp' : 'setup.manualHelp')}
      </FieldDescription>
      <FieldDescription className="setup-help" id="settings-save-status">
        {t('setup.saved')}
      </FieldDescription>
    </FieldGroup>
  );
}
export const practice = {
  title: 'setup.practiceTitle',
  body: 'setup.practiceBody',
  action: 'setup.practiceAction',
  skip: 'lobby.start',
};
export default Preparation;
