import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'INNDES CRM',
  description: 'CRM i Lead Agent dla INNDES — meble kontraktowe i produkcja B2B.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
