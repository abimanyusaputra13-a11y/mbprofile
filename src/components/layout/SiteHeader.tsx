'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { DesktopNavigation } from './DesktopNavigation';
import { MobileNavigation } from './MobileNavigation';

function HomeButton() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <Link
      href="/"
      id="nav-home-button"
      aria-label="Beranda"
      title="Beranda"
      className={`group grid size-10 sm:size-11 place-items-center rounded-xl border transition-all duration-200 shrink-0 shadow-xs ${
        isHome
          ? 'bg-blue-50 text-blue-600 border-blue-200'
          : 'border-neutral-200 bg-white text-neutral-600 hover:text-blue-600 hover:border-neutral-300 hover:bg-neutral-50'
      }`}
    >
      <Home className="size-5 transition-transform duration-200 group-hover:scale-110" />
    </Link>
  );
}

export const SiteHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="site-nav"
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        isScrolled
          ? 'shadow-sm border-b border-neutral-200/80 bg-white/95 backdrop-blur-md'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <nav
        aria-label="Navigasi Utama Platform"
        className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5 lg:px-12"
      >
        {/* Left: Mobile Toggle & Desktop Nav */}
        <div className="flex items-center gap-4">
          <Suspense fallback={<div className="h-6 w-32" />}>
            <MobileNavigation />
            <DesktopNavigation />
          </Suspense>
        </div>

        {/* Right: Home Icon */}
        <Suspense
          fallback={
            <div className="grid size-10 sm:size-11 place-items-center rounded-xl border border-neutral-200 bg-white text-neutral-400 shrink-0">
              <Home className="size-5" />
            </div>
          }
        >
          <HomeButton />
        </Suspense>
      </nav>
    </header>
  );
};
