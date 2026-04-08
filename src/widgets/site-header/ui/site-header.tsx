import Link from 'next/link';
import type { AuthSession } from '@/shared/auth';
import type { Messages } from '@/shared/i18n';
import { MobileAuthPanel } from './mobile-auth-panel';
import { LocaleSwitcher } from './locale-switcher';
import styles from './site-header.module.css';

type SiteHeaderProps = {
  messages: Messages;
  session?: AuthSession | null;
  currentPath?: string;
};

export function SiteHeader({ messages, session = null, currentPath }: SiteHeaderProps) {
  const navItems = [
    { href: '/', label: messages.header.nav.home },
    { href: '/favorites', label: messages.header.nav.favorites },
    { href: '/battles', label: messages.header.nav.battles },
    { href: '/leaderboard', label: messages.header.nav.leaderboard },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.brandBlock}>
        <div className={styles.topRow}>
          <LocaleSwitcher />
        </div>
        <Link
          href="/"
          className={styles.title}
        >
          {messages.header.title}
        </Link>
        <p className={styles.subtitle}>
          {messages.header.subtitle}
        </p>
        <MobileAuthPanel session={session} currentPath={currentPath} />
      </div>
      <nav
        className={styles.nav}
        aria-label={messages.header.navigationLabel}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={styles.navLink}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
