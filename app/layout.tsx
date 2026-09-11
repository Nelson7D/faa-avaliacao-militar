import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayoutShell } from '@/components/layout/app-layout-shell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SISTEMA DE AVALIAÇÃO INDIVIDUAL DOS MILITARES - FAA',
  description: 'Sistema Regimental de Avaliação Individual das Forças Armadas Angolanas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-AO" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <AppLayoutShell>{children}</AppLayoutShell>
      </body>
    </html>
  );
}
