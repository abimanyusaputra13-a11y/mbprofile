'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Course } from '@/types/course';
import { toggleCoursePublish, deleteCourse } from '@/lib/actions/courses';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  Globe,
  EyeOff,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Layers,
  BellRing,
} from 'lucide-react';

interface CourseListClientProps {
  initialCourses: Course[];
  error?: string;
  isConfigured: boolean;
}

export function CourseListClient({
  initialCourses,
  error,
  isConfigured,
}: CourseListClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.study_program && c.study_program.toLowerCase().includes(q))
    );
  });

  const handleTogglePublish = (course: Course) => {
    setActionError(null);
    startTransition(async () => {
      const res = await toggleCoursePublish(course.id, !course.is_published);
      if (res.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === course.id ? { ...c, is_published: !c.is_published } : c
          )
        );
      } else {
        setActionError(res.error || 'Gagal mengubah status terbit.');
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingCourse) return;
    setActionError(null);
    startTransition(async () => {
      const res = await deleteCourse(deletingCourse.id);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
        setDeletingCourse(null);
      } else {
        setActionError(res.error || 'Gagal menghapus mata kuliah.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Daftar Mata Kuliah
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Total {courses.length} mata kuliah ({courses.filter((c) => c.is_published).length} terbit, {courses.filter((c) => !c.is_published).length} draf).
          </p>
        </div>

        <Link href="/admin/courses/new">
          <PrimaryButton variant="brand" size="sm" icon={<Plus className="size-4" />}>
            Tambah Mata Kuliah Baru
          </PrimaryButton>
        </Link>
      </div>

      {/* Admin Module Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-black/20">
            <Layers className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-900">Mata Kuliah & Silabus</p>
            <p className="text-[11px] text-neutral-500">Panel aktif saat ini</p>
          </div>
        </div>

        <Link
          href="/admin/announcements"
          className="p-4 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-black/20 group-hover:scale-105 transition-transform">
              <BellRing className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 group-hover:text-blue-600 transition">
                Pengumuman & Agenda
              </p>
              <p className="text-[11px] text-neutral-500">Kelola feed berita beranda</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600">Buka →</span>
        </Link>

        <Link
          href="/admin/materials"
          className="p-4 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-black/20 group-hover:scale-105 transition-transform">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 group-hover:text-blue-600 transition">
                Materi & Bank Soal
              </p>
              <p className="text-[11px] text-neutral-500">Statistik hits & timeframe</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600">Buka →</span>
        </Link>
      </div>

      {/* Warning/Error Message */}
      {(error || actionError) && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-950">Pemberitahuan</p>
            <p className="mt-0.5 leading-relaxed">{error || actionError}</p>
          </div>
        </div>
      )}

      {/* Configuration Helper Alert if Supabase is not yet configured */}
      {!isConfigured && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
            <AlertTriangle className="size-4 text-amber-600" />
            <span>Koneksi Supabase Belum Dikonfigurasi di .env.local</span>
          </div>
          <p className="leading-relaxed text-amber-800">
            Untuk mengaktifkan sinkronisasi database dan dashboard live, masukkan <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> pada berkas <code>.env.local</code>, lalu jalankan script <code>supabase-schema.sql</code> di Supabase SQL Editor.
          </p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000]">
        <label htmlFor="search-courses" className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
          Cari Mata Kuliah
        </label>
        <SearchInput
          id="search-courses"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari berdasarkan nama mata kuliah, kode kuliah (cth: DB234101), atau program studi..."
        />
      </div>

      {/* Course List Cards / Table */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_#000] p-8">
          <BookOpen className="size-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900">
            Belum Ada Mata Kuliah yang Ditemukan
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Tidak ada mata kuliah yang cocok dengan kata kunci pencarian Anda.'
              : 'Mulai dengan menambahkan mata kuliah baru untuk mengelola materi dan RPS.'}
          </p>
          <div className="mt-4">
            <Link href="/admin/courses/new">
              <PrimaryButton variant="brand" size="sm" icon={<Plus className="size-4" />}>
                Tambah Mata Kuliah Pertama
              </PrimaryButton>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              {/* Left Column: Course Details */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs bg-neutral-900 text-white px-2.5 py-0.5 rounded-full">
                    {course.code || 'KODE BELUM ADA'}
                  </span>
                  <Badge
                    variant={course.is_published ? 'green' : 'yellow'}
                    size="sm"
                  >
                    {course.is_published ? 'Published (Publik)' : 'Draft (Draf)'}
                  </Badge>
                  {course.study_program && (
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      {course.study_program}
                    </span>
                  )}
                  {course.semester && (
                    <span className="text-[11px] text-neutral-500">
                      Semester {course.semester}
                    </span>
                  )}
                  {course.credits && (
                    <span className="text-[11px] text-neutral-500">
                      • {course.credits} SKS
                    </span>
                  )}
                  {course.academic_year && (
                    <span className="text-[11px] text-neutral-400 font-mono">
                      • {course.academic_year}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="hover:text-blue-600 transition"
                  >
                    {course.name}
                  </Link>
                </h3>

                {course.description && (
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
                {/* Publish Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleTogglePublish(course)}
                  disabled={isPending}
                  title={course.is_published ? 'Jadikan Draf' : 'Terbitkan ke Publik'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                    course.is_published
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {course.is_published ? (
                    <>
                      <EyeOff className="size-3.5" />
                      <span>Jadikan Draf</span>
                    </>
                  ) : (
                    <>
                      <Globe className="size-3.5" />
                      <span>Terbitkan</span>
                    </>
                  )}
                </button>

                {/* Edit Link */}
                <Link href={`/admin/courses/${course.id}`}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition cursor-pointer"
                  >
                    <Edit className="size-3.5" />
                    <span>Kelola</span>
                  </button>
                </Link>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setDeletingCourse(course)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 p-2 rounded-full text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition cursor-pointer"
                  title="Hapus Mata Kuliah"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCourse && (
        <Modal
          isOpen={!!deletingCourse}
          onClose={() => setDeletingCourse(null)}
          title="Konfirmasi Hapus Mata Kuliah"
          subtitle={`Kode: ${deletingCourse.code || 'Tanpa Kode'}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
              <p className="font-bold">Apakah Anda yakin ingin menghapus mata kuliah ini?</p>
              <p className="text-rose-800/90 text-xs mt-1">
                Tindakan ini akan menghapus <b>{deletingCourse.name}</b> beserta seluruh komponen penilaian, jadwal mingguan (RPS), rangkuman, dan lampiran berkas dari storage. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <SecondaryButton
                variant="outline"
                size="sm"
                onClick={() => setDeletingCourse(null)}
                disabled={isPending}
              >
                Batal
              </SecondaryButton>
              <PrimaryButton
                variant="dark"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isPending ? 'Menghapus...' : 'Ya, Hapus Sekarang'}
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
