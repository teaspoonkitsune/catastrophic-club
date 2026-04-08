import type { ReactNode } from 'react';
import type { AuthSession } from '@/shared/auth';
import { AuthSidebar } from '@/widgets/auth-sidebar';
import styles from './site-page-grid.module.css';

type SitePageGridProps = {
  children: ReactNode;
  session?: AuthSession | null;
  sidebar?: ReactNode;
};

export function SitePageGrid({ children, session = null, sidebar }: SitePageGridProps) {
  return (
    <div className={styles.grid}>
      <div className={styles.mainColumn}>{children}</div>

      <aside className={styles.sidebar}>
        <AuthSidebar session={session} />
        {sidebar}
      </aside>
    </div>
  );
}
