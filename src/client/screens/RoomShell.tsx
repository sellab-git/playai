import type { ReactNode, Ref } from 'react';
import { Button } from '../../components/ui/button';
import { Icon } from '../react-presentation';
import { t } from '../i18n';

export function RoomShell({
  title,
  status,
  error,
  warning,
  onBack,
  backDisabled,
  onMenu,
  footerRef,
  footer,
  children,
}: {
  title: string;
  status: string;
  error: string;
  warning: string;
  onBack?: () => void;
  backDisabled: boolean;
  onMenu?: () => void;
  footerRef: Ref<HTMLDivElement>;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="shell">
      <header className="header">
        {onBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="nav-button"
            disabled={backDisabled}
            aria-label={t('nav.back')}
            onClick={onBack}
          >
            <Icon path="M21 7 11 16 21 25 M11 16H28" />
          </Button>
        ) : (
          <span />
        )}
        <div className="middle">
          <h1 id="screen-title">{title}</h1>
        </div>
        {onMenu ? (
          <Button
            variant="ghost"
            size="icon"
            className="nav-button right"
            aria-label={t('nav.menu')}
            onClick={onMenu}
          >
            <Icon path="M5 9H27 M5 16H27 M5 23H27" />
          </Button>
        ) : (
          <span />
        )}
      </header>
      <p className="connection-status" role="status">
        {status}
      </p>
      <section className="body">
        <p className="ui-alert" role="alert">
          {error}
        </p>
        {warning && (
          <p className="ui-alert" role="status">
            {warning}
          </p>
        )}
        {children}
      </section>
      <footer className="actions">
        <div id="shell-actions" ref={footerRef}>
          {footer}
        </div>
      </footer>
    </main>
  );
}
