import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { getAuthSession } from '@/shared/auth';
import { I18nProvider } from '@/shared/i18n';
import { getRequestI18n } from '@/shared/i18n/server';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';
import { SiteLayoutFrame } from '@/widgets/site-layout/ui/site-layout-frame';
import './globals.css';

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin', 'cyrillic'],
});

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getRequestI18n();

  return {
    title: 'CATastrophic club',
    description: messages.metadata.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ locale, messages }, session] = await Promise.all([
    getRequestI18n(),
    getAuthSession(),
  ]);

  return (
    <html lang={locale} className={jetBrainsMono.variable}>
      <body>
        <I18nProvider locale={locale} messages={messages}>
          <SiteLayoutFrame
            header={<SiteHeader messages={messages} session={session} />}
            footer={<SiteFooter messages={messages} />}
          >
            {children}
          </SiteLayoutFrame>
        </I18nProvider>
      </body>
    </html>
  );
}
