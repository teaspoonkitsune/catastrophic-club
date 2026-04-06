import Link from 'next/link';
import type { AuthSession } from '@/shared/auth';
import { MobileAuthPanel } from './mobile-auth-panel';
import styles from './site-header.module.css';

const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/favorites', label: 'Избранное' },
  { href: '/battles', label: 'Битвы' },
  { href: '/leaderboard', label: 'Рейтинг' },
];

type SiteHeaderProps = {
  session?: AuthSession | null;
  currentPath?: string;
};

export function SiteHeader({ session = null, currentPath = '/' }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brandBlock}>
        <div className={styles.topRow}>
          <p className={styles.kicker}>место для тех, кто любит котов</p>
        </div>
        <Link
          href="/"
          className={styles.title}
        >
          CATastrophic club
        </Link>
        <p className={styles.subtitle}>
          Здесь можно посмотреть кота дня, сохранить любимчиков и устроить небольшую битву мордочек.
        </p>
        <MobileAuthPanel session={session} currentPath={currentPath} />
      </div>
      <nav
        className={styles.nav}
        aria-label="Основная навигация"
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
