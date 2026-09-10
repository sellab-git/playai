import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '../../components/ui/field';
import { Avatar, Clock, Door } from '../react-presentation';
import { t } from '../i18n';

export type EntryMode = 'home' | 'create' | 'join';
export interface EntryProps {
  mode: EntryMode;
  name: string;
  code: string;
  face: string;
  savedRoomCode: string | null;
  pending: boolean;
  onMode(mode: EntryMode): void;
  onName(name: string): void;
  onCode(code: string): void;
  onFace(): void;
  onSubmit(): void;
  onFresh(): void;
  onResume(): void;
}

export function EntryScreen(props: EntryProps) {
  const { mode, name, code, face, savedRoomCode, pending } = props;
  if (mode === 'home') {
    const recovery = !!savedRoomCode;
    return (
      <section className="home">
        <div className="hero">
          <div className="entry-symbol">{recovery ? <Door /> : <Clock />}</div>
          <h2>{t(recovery ? 'entry.recoveryTitle' : 'home.title')}</h2>
          {recovery ? (
            <>
              <p className="meta">{t('entry.code')}</p>
              <p className="room-code">{savedRoomCode}</p>
              <p className="message">{t('entry.recoveryBody')}</p>
            </>
          ) : (
            <>
              <p className="message">
                <span className="highlight highlight-blue">{t('home.intro')}</span>
              </p>
              <p className="message">{t('home.body')}</p>
            </>
          )}
        </div>
      </section>
    );
  }
  return (
    <form
      id="entry-form"
      className="form-body"
      onSubmit={(event) => {
        event.preventDefault();
        if (!pending && name.trim()) props.onSubmit();
      }}
    >
      <h2>{t(mode === 'create' ? 'entry.createTitle' : 'entry.joinTitle')}</h2>
      <p className="message">{t('entry.identity')}</p>
      <FieldGroup>
        {mode === 'join' && (
          <Field>
            <FieldLabel htmlFor="room-code">{t('entry.code')}</FieldLabel>
            <Input
              id="room-code"
              className="code-input"
              name="code"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={5}
              minLength={5}
              pattern="[A-HJ-NP-Za-hj-np-z2-9]{5}"
              value={code}
              onChange={(event) => props.onCode(event.target.value)}
              required
              aria-describedby="code-hint"
            />
            <FieldDescription id="code-hint">{t('entry.codeHint')}</FieldDescription>
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="player-name">{t('entry.name')}</FieldLabel>
          <Input
            id="player-name"
            name="name"
            autoComplete="nickname"
            maxLength={12}
            value={name}
            onChange={(event) => props.onName(event.target.value)}
            required
          />
        </Field>
      </FieldGroup>
      <div className="face-choice">
        <p className="face-label">{t('entry.face')}</p>
        <div className="face-preview">
          <Avatar faceId={face} tile="tYel" />
          <Button variant="outline" size="sm" onClick={props.onFace}>
            {t('entry.changeFace')}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function EntryActions(props: EntryProps) {
  if (props.mode !== 'home') {
    return (
      <Button type="submit" form="entry-form" disabled={props.pending}>
        {t(props.mode === 'create' ? 'entry.createAction' : 'entry.joinAction')}
      </Button>
    );
  }
  return (
    <div className="action-row two">
      {props.savedRoomCode ? (
        <>
          <Button variant="outline" onClick={props.onFresh}>
            {t('entry.newRoom')}
          </Button>
          <Button disabled={props.pending} onClick={props.onResume}>
            {t('entry.rejoin')}
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" onClick={() => props.onMode('join')}>
            {t('entry.joinAction')}
          </Button>
          <Button onClick={() => props.onMode('create')}>
            {t('entry.createAction')}
          </Button>
        </>
      )}
    </div>
  );
}
