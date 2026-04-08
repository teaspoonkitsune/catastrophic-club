import type { Messages } from '@/shared/i18n';
import styles from './site-footer.module.css';

type SiteFooterProps = {
  messages: Messages;
};

export function SiteFooter({ messages }: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.textBlock}>
        <p className={styles.text}>{messages.footer.email}</p>
        <p className={styles.text}>{messages.footer.builtWith}</p>
        <p className={styles.text}>{messages.footer.copyright}</p>
      </div>
    </footer>
  );
}
