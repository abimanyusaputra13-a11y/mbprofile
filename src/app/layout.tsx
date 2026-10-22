import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

const sansFont = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const serifFont = Playfair_Display({
  variable: '--font-serif-accent',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Departemen Manajemen Bisnis ITS — S1 Manajemen Bisnis & S1 Bisnis Digital',
  description:
    'Portal resmi Departemen Manajemen Bisnis, Fakultas Desain Kreatif dan Bisnis Digital (FDKBD / CREABIZ), Institut Teknologi Sepuluh Nopember (ITS). Menaungi program studi S1 Manajemen Bisnis dan S1 Bisnis Digital.',
  keywords: [
    'Manajemen Bisnis ITS',
    'Bisnis Digital ITS',
    'Departemen Manajemen Bisnis',
    'FDKBD',
    'CREABIZ',
    'S1 Manajemen Bisnis',
    'S1 Bisnis Digital',
    'ITS Surabaya',
    'FIBAA',
    'Akreditasi Unggul'
  ],
  authors: [{ name: 'Departemen Manajemen Bisnis ITS' }],
  openGraph: {
    title: 'Departemen Manajemen Bisnis ITS — S1 Manajemen Bisnis & S1 Bisnis Digital',
    description:
      'Portal resmi Departemen Manajemen Bisnis, Institut Teknologi Sepuluh Nopember (ITS) — S1 Manajemen Bisnis & S1 Bisnis Digital.',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${sansFont.variable} ${serifFont.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-white text-neutral-900 font-sans selection:bg-blue-100 selection:text-blue-900"
        suppressHydrationWarning
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
