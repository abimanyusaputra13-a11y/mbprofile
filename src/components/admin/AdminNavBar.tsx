'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, BellRing, BookOpen } from 'lucide-react';

export function AdminNavBar() {
  const pathname = usePathname();

  const isCoursesActive =
    pathname === '/admin' || pathname.startsWith('/admin/courses') || pathname.startsWith('/admin/quizzes');
  const isAnnouncementsActive = pathname.startsWith('/admin/announcements');
  const isMaterialsActive = pathname.startsWith('/admin/materials');

  const navItems = [
    {
      name: 'Mata Kuliah & Silabus',
      href: '/admin',
      icon: Layers,
      isActive: isCoursesActive,
    },
    {
      name: 'Pengumuman & Agenda',
      href: '/admin/announcements',
      icon: BellRing,
      isActive: isAnnouncementsActive,
    },
    {
      name: 'Materi & Bank Soal',
      href: '/admin/materials',
      icon: BookOpen,
      isActive: isMaterialsActive,
    },
  ];

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto py-2 -mx-2 px-2 border-t border-neutral-100">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              item.isActive
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Icon className="size-3.5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
