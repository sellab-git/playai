import { memo } from 'react';
import qrcode from 'qrcode-generator';
import { Button } from '../../components/ui/button';
import { Tick } from '../react-presentation';
import { t } from '../i18n';
import { invitation } from '../sharing';

const Qr = memo(function Qr({ value }: { value: string }) {
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();
  const size = qr.getModuleCount();
  let path = '';
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      if (qr.isDark(y, x)) path += `M${x + 4} ${y + 4}h1v1h-1z`;
    }
  return (
    <svg className="invite-qr" viewBox={`0 0 ${size + 8} ${size + 8}`} aria-hidden="true">
      <path fill="currentColor" d={path} />
    </svg>
  );
});

function CopyButton({
  label,
  copied,
  onCopy,
}: {
  label: string;
  copied: boolean;
  onCopy(): void;
}) {
  return (
    <Button type="button" variant="outline" onClick={onCopy}>
      <span className="copy-mark" data-visible={copied}>
        <Tick />
      </span>
      {t(label)}
    </Button>
  );
}

export function InviteDialog({
  code,
  copied,
  onCopy,
}: {
  code: string;
  copied: string | null;
  onCopy(kind: 'code' | 'link'): void;
}) {
  return (
    <div className="invitation">
      <Qr value={invitation(code)} />
      <p className="room-code">{code}</p>
      <p className="meta">{t('room.inviteBody')}</p>
      <div className="dialog-actions">
        <CopyButton
          label="room.copyCode"
          copied={copied === 'code'}
          onCopy={() => onCopy('code')}
        />
        <CopyButton
          label="room.copyLink"
          copied={copied === 'link'}
          onCopy={() => onCopy('link')}
        />
      </div>
    </div>
  );
}

export function ShareDialog({
  text,
  copied,
  onCopy,
  onShare,
}: {
  text: string;
  copied: boolean;
  onCopy(): void;
  onShare?: () => void;
}) {
  return (
    <>
      <p className="meta">{t('room.shareHint')}</p>
      <pre className="share-text">{text}</pre>
      <div className="dialog-actions">
        {onShare && (
          <Button type="button" onClick={onShare}>
            {t('room.shareSend')}
          </Button>
        )}
        <CopyButton label="room.copyResults" copied={copied} onCopy={onCopy} />
      </div>
    </>
  );
}
