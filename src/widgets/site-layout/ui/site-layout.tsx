import type { ReactNode } from 'react';
import type { AuthSession } from '@/shared/auth';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';
import { SiteLayoutFrame } from './site-layout-frame';

type SiteLayoutProps = {
  children: ReactNode;
  session?: AuthSession | null;
};

export function SiteLayout({ children, session = null }: SiteLayoutProps) {
  return (
    <SiteLayoutFrame
      header={<SiteHeader session={session} />}
      footer={<SiteFooter />}
    >
      {children}
    </SiteLayoutFrame>
  );
}
