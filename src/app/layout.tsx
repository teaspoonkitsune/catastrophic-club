import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { getAuthSession } from '@/shared/auth';
import { SiteLayout } from '@/widgets/site-layout';
import './globals.css';

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'CATastrophic club',
  description: 'Клуб любителей котов с котом дня, боями и избранным.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();

  return (
    <html lang="ru" className={jetBrainsMono.variable}>
      <body>
        <SiteLayout session={session}>{children}</SiteLayout>
      </body>
    </html>
  );
}
