import React from 'react';
import { connection } from 'next/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { getPublicPublishedCourses } from '@/lib/actions/courses';
import { CoursesDirectoryClient } from './CoursesDirectoryClient';
import { BookOpen, GraduationCap } from 'lucide-react';

export const metadata = {
  title: 'Daftar Mata Kuliah & Modul Mingguan - Departemen Manajemen Bisnis ITS',
  description:
    'Akses silabus perkuliahan, topik mingguan, materi bacaan, berkas lampiran, dan kuis evaluasi.',
};

export default async function CoursesDirectoryPage() {
  await connection();
  const { data: courses, error } = await getPublicPublishedCourses();

  return (
    <div className="py-10 min-h-screen">
      <PageContainer>
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-neutral-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden border-2 border-black shadow-[6px_6px_0px_0px_#000]">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                <GraduationCap className="size-4" />
                <span>Kurikulum &amp; Modul Perkuliahan MB ITS</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Daftar Mata Kuliah &amp; Modul Mingguan
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-light">
                Pilih mata kuliah untuk mengakses silabus resmi, materi bacaan terstruktur tiap minggu, unduhan slide materi/diktat, serta kuis evaluasi mandiri.
              </p>
            </div>

            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <BookOpen className="size-72 text-white" />
            </div>
          </div>

          {/* Interactive Courses Directory with Search & Semester Filtering */}
          <CoursesDirectoryClient initialCourses={courses || []} error={error} />
        </div>
      </PageContainer>
    </div>
  );
}
