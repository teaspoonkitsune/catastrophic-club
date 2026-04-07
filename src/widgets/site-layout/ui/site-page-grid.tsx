import type { ReactNode } from 'react';
import type { AuthSession } from '@/shared/auth';
import { AuthSidebar } from '@/widgets/auth-sidebar';

type SitePageGridProps = {
  children: ReactNode;
  session?: AuthSession | null;
  sidebar?: ReactNode;
};

export function SitePageGrid({ children, session = null, sidebar }: SitePageGridProps) {
  return (
    <div className="page-grid">
      <div className="page-main-column">{children}</div>

      <aside className="page-sidebar">
        <AuthSidebar session={session} />
        {sidebar}
      </aside>
    </div>
  );
}
