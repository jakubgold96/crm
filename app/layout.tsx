import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Geist (SIL OFL 1.1, app/fonts/Geist-LICENSE.txt) — krój tekstu, serwowany z repo.
// Chakra Petch (nagłówki/liczby) i JetBrains Mono (dane) są w app/globals.css.
const geistSans = localFont({
  src: './fonts/Geist-Variable.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'INNDES CRM',
  description: 'CRM i Lead Agent dla INNDES — meble kontraktowe i produkcja B2B.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
