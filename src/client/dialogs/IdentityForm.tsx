import { useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Field, FieldGroup, FieldLabel, FieldError } from '../../components/ui/field';
import { Avatar, Tick } from '../react-presentation';
import { t } from '../i18n';

interface IdentityFormProps {
  name: string;
  face: string;
  tile: string;
  error: string;
  disabled: boolean;
  onNameChange(name: string): void;
  onChooseFace(): void;
  onSave(): void;
}

/** The dialog owns the draft so choosing a face never discards a typed name. */
export function IdentityForm({
  name,
  face,
  tile,
  error,
  disabled,
  onNameChange,
  onChooseFace,
  onSave,
}: IdentityFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) inputRef.current?.focus();
        onSave();
      }}
    >
      <FieldGroup>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="identity-name">{t('entry.name')}</FieldLabel>
          <Input
            ref={inputRef}
            id="identity-name"
            maxLength={12}
            value={name}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'identity-error' : undefined}
            onChange={(event) => onNameChange(event.target.value)}
          />
          {error && <FieldError id="identity-error">{error}</FieldError>}
        </Field>
        <div className="face-preview">
          <Avatar faceId={face} tile={tile} />
          <Button type="button" variant="outline" size="sm" onClick={onChooseFace}>
            {t('entry.changeFace')}
          </Button>
        </div>
        <Button type="submit" disabled={disabled}>
          <Tick />
          {t('room.saveIdentity')}
        </Button>
      </FieldGroup>
    </form>
  );
}
