'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Course } from '@/types/course';
import {
  toggleCoursePublish,
  deleteCourse,
  bulkUpdateCoursePublish,
  bulkDeleteCourses,
} from '@/lib/actions/courses';
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
  Layers,
  BellRing,
  CheckCircle2,
  Settings2,
  Archive,
  RotateCcw,
  CheckSquare,
  Square,
  X,
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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.study_program && c.study_program.toLowerCase().includes(q))
    );
  });

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllSelected =
    filteredCourses.length > 0 &&
    filteredCourses.every((c) => selectedIds.has(c.id));

  const isSomeSelected =
    filteredCourses.some((c) => selectedIds.has(c.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredCourses.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredCourses.forEach((c) => next.add(c.id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectedCourses = courses.filter((c) => selectedIds.has(c.id));

  // Single publish toggle
  const handleTogglePublish = (course: Course) => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await toggleCoursePublish(course.id, !course.is_published);
      if (res.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === course.id ? { ...c, is_published: !c.is_published } : c
          )
        );
        setActionSuccess(
          `Status mata kuliah "${course.name}" berhasil diubah menjadi ${
            !course.is_published ? 'Publik' : 'Draf'
          }.`
        );
      } else {
        setActionError(res.error || 'Gagal mengubah status terbit.');
      }
    });
  };

  // Single course delete
  const handleDeleteConfirm = () => {
    if (!deletingCourse) return;
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await deleteCourse(deletingCourse.id);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(deletingCourse.id);
          return next;
        });
        setActionSuccess(`Mata kuliah "${deletingCourse.name}" berhasil dihapus.`);
        setDeletingCourse(null);
      } else {
        setActionError(res.error || 'Gagal menghapus mata kuliah.');
      }
    });
  };

  // Bulk publish / archive
  const handleBulkPublish = (isPublished: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await bulkUpdateCoursePublish(ids, isPublished);
      if (res.success) {
        setCourses((prev) =>
          prev.map((c) =>
            selectedIds.has(c.id) ? { ...c, is_published: isPublished } : c
          )
        );
        setActionSuccess(
          isPublished
            ? `Berhasil mempublikasikan ${ids.length} mata kuliah ke publik.`
            : `Berhasil mengarsipkan / menjadikan draf ${ids.length} mata kuliah.`
        );
        setSelectedIds(new Set());
        setIsActionModalOpen(false);
      } else {
        setActionError(res.error || 'Gagal memperbarui status mata kuliah.');
      }
    });
  };

  // Bulk delete confirmation
  const handleBulkDeleteConfirm = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await bulkDeleteCourses(ids);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => !selectedIds.has(c.id)));
        setActionSuccess(`Berhasil menghapus ${ids.length} mata kuliah secara permanen.`);
        setSelectedIds(new Set());
        setIsBulkDeleteModalOpen(false);
        setIsActionModalOpen(false);
      } else {
        setActionError(res.error || 'Gagal menghapus mata kuliah terpilih.');
      }
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Daftar Mata Kuliah
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Total {courses.length} mata kuliah ({courses.filter((c) => c.is_published).length} terbit,{' '}
            {courses.filter((c) => !c.is_published).length} draf).
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
            <p className="text-xs font-bold text-neutral-900">Mata Kuliah &amp; Silabus</p>
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
                Pengumuman &amp; Agenda
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
                Materi &amp; Bank Soal
              </p>
              <p className="text-[11px] text-neutral-500">Statistik hits &amp; timeframe</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600">Buka →</span>
        </Link>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs flex items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold p-1 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Warning/Error Message */}
      {(error || actionError) && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-rose-950">Pemberitahuan</p>
            <p className="mt-0.5 leading-relaxed">{error || actionError}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-700 hover:text-rose-950 font-bold p-1 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
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

      {/* Selection & Bulk Action Toolbar */}
      {filteredCourses.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-neutral-800 select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = isSomeSelected;
                  }
                }}
                onChange={handleToggleSelectAll}
                className="size-5 rounded-md border-2 border-black accent-blue-600 cursor-pointer"
              />
              <span>
                {isAllSelected
                  ? 'Batal Pilih Semua'
                  : `Pilih Semua (${filteredCourses.length})`}
              </span>
            </label>

            {selectedIds.size > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {selectedIds.size} dipilih
              </span>
            )}
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Button to open bulk control modal */}
              <button
                type="button"
                onClick={() => setIsActionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition cursor-pointer border border-black shadow-[2px_2px_0px_0px_#000]"
              >
                <Settings2 className="size-3.5" />
                <span>Modal Kontrol ({selectedIds.size})</span>
              </button>

              <button
                type="button"
                onClick={() => handleBulkPublish(true)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition cursor-pointer"
                title="Publikasikan semua yang dipilih"
              >
                <Globe className="size-3.5" />
                <span>Publikasikan</span>
              </button>

              <button
                type="button"
                onClick={() => handleBulkPublish(false)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition cursor-pointer"
                title="Arsipkan / Jadikan Draf semua yang dipilih"
              >
                <EyeOff className="size-3.5" />
                <span>Arsipkan</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 transition cursor-pointer"
                title="Hapus semua yang dipilih"
              >
                <Trash2 className="size-3.5" />
                <span>Hapus</span>
              </button>

              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline font-medium cursor-pointer ml-1"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      )}

      {/* Course List Cards */}
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
          {filteredCourses.map((course) => {
            const isSelected = selectedIds.has(course.id);

            return (
              <div
                key={course.id}
                className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-3xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/15 shadow-[6px_6px_0px_0px_#2563eb]'
                    : 'border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5'
                }`}
              >
                {/* Left Column: Checkbox & Course Details */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1">
                  {/* Item Checkbox */}
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="pt-0.5 sm:pt-0 shrink-0 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(course.id)}
                      className="size-5 rounded-md border-2 border-black accent-blue-600 cursor-pointer transition-all"
                    />
                  </label>

                  <div className="space-y-1.5 flex-1 min-w-0">
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
                </div>

                {/* Right Column: Actions */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap pl-8 sm:pl-0">
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
            );
          })}
        </div>
      )}

      {/* Floating Bottom Quick Action Bar when 1+ courses are selected */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-neutral-900 text-white p-3.5 sm:p-4 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_#000] flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center size-8 rounded-full bg-blue-600 text-white font-black text-xs">
              {selectedIds.size}
            </span>
            <div className="text-left">
              <p className="text-xs font-bold leading-none">Mata Kuliah Dipilih</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Siap dikelola bersama</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsActionModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-neutral-900 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <Settings2 className="size-3.5" />
              <span>Modal Kontrol</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkPublish(true)}
              disabled={isPending}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer flex items-center gap-1"
            >
              <Globe className="size-3.5" />
              <span>Publikasikan</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkPublish(false)}
              disabled={isPending}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition cursor-pointer flex items-center gap-1"
            >
              <EyeOff className="size-3.5" />
              <span>Arsipkan</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              disabled={isPending}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="size-3.5" />
              <span>Hapus</span>
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="px-2 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal Kontrol Tindakan Mata Kuliah Terpilih */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title="Modal Kontrol Mata Kuliah Terpilih"
        subtitle={`${selectedCourses.length} mata kuliah dipilih untuk tindakan massal`}
        maxWidth="2xl"
      >
        <div className="space-y-5 text-xs sm:text-sm text-neutral-700">
          {/* Selected items list box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
              <span>Daftar Mata Kuliah Terpilih ({selectedCourses.length}):</span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                Hapus Semua Pilihan
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
              {selectedCourses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-neutral-200 shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[11px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
                      {c.code || 'NO-CODE'}
                    </span>
                    <span className="font-semibold text-neutral-900 truncate">
                      {c.name}
                    </span>
                    <Badge variant={c.is_published ? 'green' : 'yellow'} size="sm">
                      {c.is_published ? 'Publik' : 'Draf'}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSelect(c.id)}
                    className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                    title="Hapus dari pilihan"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Cards */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Pilih Tindakan yang Ingin Diterapkan:
            </p>

            {/* 1. Mempublikasikan */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border-2 border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                  <Globe className="size-4" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Mempublikasikan</h4>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                    Terbitkan semua mata kuliah yang dipilih agar tampil dan dapat diakses mahasiswa di direktori website.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleBulkPublish(true)}
                disabled={isPending || selectedCourses.length === 0}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isPending ? 'Memproses...' : `Publikasikan (${selectedCourses.length})`}
              </button>
            </div>

            {/* 2. Mengarsipkan */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <EyeOff className="size-4" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Mengarsipkan (Jadikan Draf)</h4>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                    Sembunyikan dari direktori publik mahasiswa tanpa menghapus data RPS, modul mingguan, atau dokumen.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleBulkPublish(false)}
                disabled={isPending || selectedCourses.length === 0}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isPending ? 'Memproses...' : `Arsipkan (${selectedCourses.length})`}
              </button>
            </div>

            {/* 3. Menghapus */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border-2 border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-800 shrink-0 mt-0.5">
                  <Trash2 className="size-4" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Menghapus Secara Permanen</h4>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                    Hapus permanen dari database dan storage beserta seluruh jadwal RPS, silabus, dan kuis terkait.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                disabled={isPending || selectedCourses.length === 0}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer shrink-0 disabled:opacity-50"
              >
                Hapus Terpilih ({selectedCourses.length})
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-neutral-100">
            <SecondaryButton
              variant="outline"
              size="sm"
              onClick={() => setIsActionModalOpen(false)}
            >
              Tutup Modal
            </SecondaryButton>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="Konfirmasi Hapus Massal Mata Kuliah"
        subtitle={`Akan menghapus ${selectedCourses.length} mata kuliah`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2">
            <p className="font-bold">
              Apakah Anda yakin ingin menghapus {selectedCourses.length} mata kuliah ini?
            </p>
            <p className="text-rose-800/90 text-xs leading-relaxed">
              Tindakan ini permanen. Semua data mata kuliah, topik mingguan (RPS), komponen penilaian, kuis evaluasi, dan berkas lampiran di storage akan dihapus sepenuhnya dan tidak dapat dipulihkan.
            </p>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            {selectedCourses.map((c) => (
              <div key={c.id} className="text-xs font-semibold text-neutral-800 flex items-center gap-2 truncate">
                <span className="font-mono text-[10px] bg-neutral-900 text-white px-1.5 py-0.2 rounded">
                  {c.code || 'MB'}
                </span>
                <span className="truncate">{c.name}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <SecondaryButton
              variant="outline"
              size="sm"
              onClick={() => setIsBulkDeleteModalOpen(false)}
              disabled={isPending}
            >
              Batal
            </SecondaryButton>
            <PrimaryButton
              variant="dark"
              size="sm"
              onClick={handleBulkDeleteConfirm}
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isPending ? 'Menghapus...' : `Ya, Hapus ${selectedCourses.length} Mata Kuliah`}
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      {/* Single Delete Confirmation Modal */}
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
