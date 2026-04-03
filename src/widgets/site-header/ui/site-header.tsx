import Link from 'next/link';
import type { AuthSession } from '@/shared/auth';
import { buildAuthHref } from '@/shared/auth/links';
import styles from './site-header.module.css';

const navItems = [
  { href: '/', label: 'home' },
  { href: '/favorites', label: 'favorites' },
  { href: '/battles', label: 'battles' },
  { href: '/leaderboard', label: 'leaders' },
];

type SiteHeaderProps = {
  session?: AuthSession | null;
  currentPath?: string;
};

export function SiteHeader({
  session = null,
  currentPath = '/',
}: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brandBlock}>
        <div className={styles.topRow}>
          <p className={styles.kicker}>personal homepage for cat appreciators</p>
          <div className={styles.authBlock}>
            {session ? (
              <>
                <span className={styles.authLabel}>
                  signed in as {session.user.name ?? session.user.email}
                </span>
                <a href={buildAuthHref('logout', currentPath)} className={styles.authButton}>
                  logout
                </a>
              </>
            ) : (
              <>
                <a href={buildAuthHref('login', currentPath)} className={styles.authButton}>
                  login
                </a>
                <a href={buildAuthHref('register', currentPath)} className={styles.authButtonAlt}>
                  register
                </a>
              </>
            )}
          </div>
        </div>
        <Link href="/" className={styles.title}>
          CATastrophic club
        </Link>
        <p className={styles.subtitle}>КОТострофический клуб с котом дня, боями и полкой избранного.</p>
      </div>
      <nav className={styles.nav} aria-label="Основная навигация">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={styles.navLink}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
