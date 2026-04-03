import type { Metadata } from 'next';
import { Inconsolata } from 'next/font/google';
import './globals.css';

const inconsolata = Inconsolata({
  variable: '--font-inconsolata',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'CATastrophic club',
  description: 'Клуб любителей котов с котом дня, боями и избранным.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inconsolata.variable}>
      <body>{children}</body>
    </html>
  );
}
