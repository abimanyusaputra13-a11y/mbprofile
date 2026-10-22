'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV_ROUTES } from '@/data/navigation';

export const DesktopNavigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center">
      <ul className="flex items-center gap-6 xl:gap-8 text-base font-medium">
        {PRIMARY_NAV_ROUTES.map((route) => {
          const isActive =
            route.path === '/'
              ? pathname === '/'
              : pathname === route.path || pathname.startsWith(`${route.path}/`);

          return (
            <li key={route.path}>
              <Link
                href={route.path}
                aria-current={isActive ? 'page' : undefined}
                className={`transition-colors py-1 decoration-2 underline-offset-8 ${
                  isActive
                    ? 'font-bold text-blue-600 underline decoration-blue-600'
                    : 'text-neutral-700 hover:text-black hover:underline hover:decoration-neutral-400'
                }`}
              >
                {route.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
