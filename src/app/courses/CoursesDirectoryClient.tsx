'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CourseWithDetails } from '@/types/course';
import {
  Search,
  X,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  RotateCcw,
  SearchX,
} from 'lucide-react';

interface CoursesDirectoryClientProps {
  initialCourses: CourseWithDetails[];
  error?: string;
}

const SEMESTER_OPTIONS = ['Semua', '1', '2', '3', '4', '5', '6', '7', '8'];

export function CoursesDirectoryClient({
  initialCourses,
  error,
}: CoursesDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Semua');

  // Compute course count per semester
  const courseCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Semua: initialCourses.length,
    };
    for (let i = 1; i <= 8; i++) {
      counts[String(i)] = 0;
    }
    initialCourses.forEach((c) => {
      if (c.semester !== null && c.semester !== undefined) {
        const semKey = String(c.semester);
        counts[semKey] = (counts[semKey] || 0) + 1;
      }
    });
    return counts;
  }, [initialCourses]);

  // Dynamic filtering based on search query and semester badge
  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return initialCourses.filter((course) => {
      // Semester filter
      if (selectedSemester !== 'Semua') {
        const courseSem =
          course.semester !== null && course.semester !== undefined
            ? String(course.semester)
            : '';
        if (courseSem !== selectedSemester) {
          return false;
        }
      }

      // Quick Search query
      if (query) {
        const name = (course.name || '').toLowerCase();
        const code = (course.code || '').toLowerCase();
        const studyProgram = (course.study_program || '').toLowerCase();
        const description = (course.description || '').toLowerCase();
        const topicMatch = course.weekly_topics?.some(
          (t) =>
            (t.topic_title || '').toLowerCase().includes(query) ||
            (t.subtopics || '').toLowerCase().includes(query)
        );

        const matches =
          name.includes(query) ||
          code.includes(query) ||
          studyProgram.includes(query) ||
          description.includes(query) ||
          topicMatch;

        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }, [initialCourses, searchQuery, selectedSemester]);

  const handleSemesterClick = (sem: string) => {
    if (selectedSemester === sem && sem !== 'Semua') {
      setSelectedSemester('Semua');
    } else {
      setSelectedSemester(sem);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSemester('Semua');
  };

  const isFilterActive = searchQuery.trim() !== '' || selectedSemester !== 'Semua';

  return (
    <div className="space-y-8">
      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-xs text-rose-700">
          Gagal memuat mata kuliah: {error}
        </div>
      )}

      {/* When no courses in database at all */}
      {initialCourses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-3">
          <BookOpen className="size-12 text-neutral-300 mx-auto" />
          <h3 className="text-base font-bold text-neutral-800">
            Belum Ada Mata Kuliah yang Dipublikasikan
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Silakan periksa kembali nanti atau hubungi pengajar / administrator untuk mempublikasikan mata kuliah.
          </p>
        </div>
      ) : (
        <>
          {/* Quick Search & Semester Filter Bar (Horizontally Scrollable) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Pencarian Cepat
                </span>
                <span className="text-neutral-300 font-bold">•</span>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Filter Semester
                </span>
              </div>
              <div className="text-xs text-neutral-500 font-medium">
                Menampilkan{' '}
                <span className="font-bold text-neutral-900">
                  {filteredCourses.length}
                </span>{' '}
                dari {initialCourses.length} mata kuliah
                {isFilterActive && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="ml-2.5 text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable track containing Search Bar on the left followed by Semester Badges */}
            <div className="overflow-x-auto pb-1.5 pt-1 -my-1 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
              <div className="flex items-center gap-3 min-w-max">
                {/* Search Bar on the Left */}
                <div className="relative w-64 sm:w-80 shrink-0">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Search className="size-4" />
                  </div>
                  <input
                    id="search-course-input"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari mata kuliah, kode (DB...), atau topik..."
                    aria-label="Cari mata kuliah berdasarkan nama, kode, atau topik"
                    className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-neutral-50 hover:bg-white focus:bg-white border-2 border-neutral-300 focus:border-black rounded-full text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Hapus pencarian"
                      className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="h-7 w-px bg-neutral-200 shrink-0" />

                {/* Semester Badges Track */}
                <div className="flex items-center gap-2 shrink-0">
                  {SEMESTER_OPTIONS.map((sem) => {
                    const isSelected = selectedSemester === sem;
                    const count = courseCounts[sem] || 0;

                    return (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => handleSemesterClick(sem)}
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] -translate-y-0.5'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 hover:border-black'
                        }`}
                      >
                        <span>{sem === 'Semua' ? 'Semua' : `Semester ${sem}`}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono leading-none ${
                            isSelected
                              ? 'bg-blue-800 text-white font-bold'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Filter results empty state */}
          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border-2 border-black shadow-[6px_6px_0px_0px_#000] max-w-xl mx-auto space-y-4">
              <div className="grid place-items-center size-14 rounded-2xl bg-neutral-100 border border-black/20 text-neutral-600 mx-auto">
                <SearchX className="size-7 text-neutral-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                  Mata Kuliah Tidak Ditemukan
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-md mx-auto">
                  {searchQuery ? (
                    <>
                      Tidak ada mata kuliah yang cocok dengan kata kunci{' '}
                      <span className="font-semibold text-neutral-800">
                        &quot;{searchQuery}&quot;
                      </span>
                      {selectedSemester !== 'Semua' && (
                        <> pada Semester {selectedSemester}</>
                      )}
                      .
                    </>
                  ) : (
                    <>
                      Belum ada mata kuliah yang tersedia untuk Semester{' '}
                      {selectedSemester}.
                    </>
                  )}
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-blue-600 text-white font-bold text-xs transition border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset Pencarian &amp; Filter</span>
                </button>
              </div>
            </div>
          ) : (
            /* Courses Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const topicCount = course.weekly_topics?.length || 0;
                const attCount = course.attachments?.length || 0;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between group space-y-5"
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
                        prefetch={false}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-neutral-900 group-hover:bg-blue-600 text-white font-bold text-xs transition border border-black shadow-[2px_2px_0px_0px_#000]"
                      >
                        <span>Buka Silabus &amp; Modul</span>
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
