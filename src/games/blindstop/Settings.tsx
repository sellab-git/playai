'use client';

import { useState } from 'react';
import type { Json } from '../../engine';
import { Preparation, settingsDraft, parseSettings } from './Preparation';
import { t } from '../../client/i18n';

/** Input text stays local; only validated settings become server commands. */
export function Settings({
  settings,
  disabled,
  onChange,
}: {
  settings: Json;
  disabled: boolean;
  onChange(settings: Json | null): void;
}) {
  const [value, setValue] = useState(() => settingsDraft(settings));
  const serialized = JSON.stringify(settings);
  const [observed, setObserved] = useState(serialized);
  if (observed !== serialized) {
    setObserved(serialized);
    if (parseSettings(value)) setValue(settingsDraft(settings));
  }
  return (
    <Preparation
      value={value}
      disabled={disabled}
      error={parseSettings(value) ? undefined : t('room.invalidSettings')}
      onChange={(next) => {
        setValue(next);
        onChange(parseSettings(next));
      }}
    />
  );
}
