'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV_ROUTES } from '@/data/navigation';
import { Menu, X, BookOpen, GraduationCap, Trophy, FileText, Sparkles, Layers, Home } from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock scroll & handle Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getRouteIcon = (path: string) => {
    switch (path) {
      case '/':
        return <Home className="size-5 text-blue-600" />;
      case '/courses':
        return <Layers className="size-5 text-indigo-600" />;
      case '/materi-soal':
        return <BookOpen className="size-5 text-blue-600" />;
      case '/dosen':
        return <GraduationCap className="size-5 text-blue-600" />;
      case '/wall-of-fame':
        return <Trophy className="size-5 text-amber-500" />;
      default:
        return <Sparkles className="size-5 text-neutral-400" />;
    }
  };

  return (
    <div className="lg:hidden">
      {/* Burger Toggle Button */}
      <button
        id="mobile-nav-toggle"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Buka menu navigasi"
        aria-expanded={isOpen}
        aria-controls="mobile-sidebar-drawer"
        className="grid size-11 place-items-center rounded-full border border-neutral-300 bg-white text-neutral-900 transition hover:border-blue-600 hover:text-blue-600 cursor-pointer shadow-xs"
      >
        <Menu className="size-6" />
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-60 bg-neutral-950/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in Drawer */}
      <aside
        id="mobile-sidebar-drawer"
        aria-label="Menu navigasi mobile"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-70 flex w-80 max-w-[85vw] flex-col justify-between bg-white p-6 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5"
            >
              <div className="grid place-items-center size-9 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-sm">
                MB
              </div>
              <div>
                <span className="block text-sm font-bold tracking-tight text-neutral-900 leading-tight">
                  MANAJEMEN BISNIS
                </span>
                <span className="block text-[10px] font-medium text-neutral-500">
                  Departemen Manajemen Bisnis ITS
                </span>
              </div>
            </Link>

            <button
              id="mobile-nav-close"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup menu navigasi"
              className="grid size-9 place-items-center rounded-full border border-neutral-200 text-neutral-600 hover:border-blue-600 hover:text-blue-600 transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-2">
              Menu Utama
            </p>
            <ul className="space-y-1.5">
              {PRIMARY_NAV_ROUTES.map((route) => {
                const isActive =
                  route.path === '/'
                    ? pathname === '/'
                    : pathname === route.path || pathname.startsWith(`${route.path}/`);

                return (
                  <li key={route.path}>
                    <Link
                      href={route.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-base font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                      }`}
                    >
                      <span className="shrink-0">{getRouteIcon(route.path)}</span>
                      <div className="flex-1">
                        <span className="block">{route.name}</span>
                        {route.description && (
                          <span className="block text-[11px] font-normal text-neutral-400 truncate">
                            {route.description}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-neutral-100 text-xs text-neutral-500 space-y-1">
          <p className="font-semibold text-neutral-800">Departemen Manajemen Bisnis ITS</p>
          <p className="text-[11px]">Fakultas Desain Kreatif dan Bisnis Digital (CREABIZ), Kampus ITS Sukolilo, Surabaya</p>
          <p className="text-[10px] text-neutral-400 pt-2">© 2026 Departemen Manajemen Bisnis ITS</p>
        </div>
      </aside>
    </div>
  );
};
