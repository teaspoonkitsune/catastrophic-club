'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type PageTone = 'purple' | 'yellow' | 'red' | 'blue';

type SiteLayoutFrameProps = {
  children: ReactNode;
  footer: ReactNode;
  header: ReactNode;
};

const PAGE_TONES: Record<string, PageTone> = {
  '/': 'purple',
  '/battles': 'red',
  '/favorites': 'yellow',
  '/leaderboard': 'blue',
};

function getPageTone(pathname: string): PageTone {
  return PAGE_TONES[pathname] ?? 'purple';
}

export function SiteLayoutFrame({ children, footer, header }: SiteLayoutFrameProps) {
  const pathname = usePathname();

  return (
    <main data-page-tone={getPageTone(pathname)}>
      {header}
      {children}
      {footer}
    </main>
  );
}
