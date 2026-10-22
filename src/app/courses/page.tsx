import React from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { getPublicPublishedCourses } from '@/lib/actions/courses';
import {
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  GraduationCap,
  Sparkles,
  FileText,
  Award,
} from 'lucide-react';

export const metadata = {
  title: 'Daftar Mata Kuliah & Modul Mingguan - Departemen Manajemen Bisnis ITS',
  description:
    'Akses silabus perkuliahan, topik mingguan, materi bacaan, berkas lampiran, dan kuis evaluasi.',
};

export const instant = false;

export default async function CoursesDirectoryPage() {
  await connection();
  const { data: courses, error } = await getPublicPublishedCourses();

  return (
    <div className="py-10 min-h-screen">
      <PageContainer>
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-neutral-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                <GraduationCap className="size-4" />
                <span>Kurikulum & Modul Perkuliahan MB ITS</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Daftar Mata Kuliah & Modul Mingguan
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-light">
                Pilih mata kuliah untuk mengakses silabus resmi, materi bacaan terstruktur tiap minggu, unduhan slide materi/diktat, serta kuis evaluasi mandiri.
              </p>
            </div>

            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <BookOpen className="size-72 text-white" />
            </div>
          </div>

          {/* Courses List */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              Gagal memuat mata kuliah: {error}
            </div>
          )}

          {courses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 space-y-3">
              <BookOpen className="size-12 text-neutral-300 mx-auto" />
              <h3 className="text-base font-bold text-neutral-800">
                Belum Ada Mata Kuliah yang Dipublikasikan
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Silakan periksa kembali nanti atau hubungi pengajar / administrator untuk mempublikasikan mata kuliah.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const topicCount = course.weekly_topics?.length || 0;
                const attCount = course.attachments?.length || 0;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl p-6 border border-neutral-200/90 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                          {course.code || 'MB'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {course.credits && (
                            <span className="text-[11px] font-semibold text-neutral-500">
                              {course.credits} SKS
                            </span>
                          )}
                          {course.semester && (
                            <span className="text-[11px] font-semibold text-neutral-400">
                              • Sem {course.semester}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition">
                          {course.name}
                        </h2>
                        {course.study_program && (
                          <p className="text-xs text-neutral-400 font-medium mt-0.5">
                            {course.study_program}
                          </p>
                        )}
                      </div>

                      {course.description && (
                        <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 font-normal">
                          {course.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4 pt-3 border-t border-neutral-100">
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span className="flex items-center gap-1 font-semibold">
                          <Calendar className="size-3.5 text-blue-600" />
                          <span>{topicCount} Topik Mingguan</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="size-3.5 text-amber-600" />
                          <span>{attCount} Berkas</span>
                        </span>
                      </div>

                      <Link
                        href={`/courses/${course.id}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-neutral-900 group-hover:bg-blue-600 text-white font-bold text-xs transition shadow-xs"
                      >
                        <span>Buka Silabus & Modul</span>
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
