'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Badge } from '@/components/ui/Badge';
import { saveCourseBasic } from '@/lib/actions/courses';
import { ArrowLeft, BookPlus, AlertCircle } from 'lucide-react';

export default function NewCoursePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [studyProgram, setStudyProgram] = useState('S1 Manajemen Bisnis');
  const [semester, setSemester] = useState<string>('1');
  const [credits, setCredits] = useState<string>('3');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama mata kuliah wajib diisi.');
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await saveCourseBasic({
        name: name.trim(),
        code: code.trim() || null,
        study_program: studyProgram || null,
        semester: semester ? parseInt(semester, 10) : null,
        credits: credits ? parseInt(credits, 10) : null,
        academic_year: academicYear.trim() || null,
        description: description.trim() || null,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        router.push(`/admin/courses/${res.data.id}`);
      }
    });
  };

  return (
    <PageContainer size="narrow">
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke Daftar Mata Kuliah</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="grid place-items-center size-12 rounded-2xl bg-blue-50 text-blue-600">
            <BookPlus className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                Tambah Mata Kuliah Baru
              </h2>
              <Badge variant="yellow" size="sm">
                Status: Draf
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Mata kuliah yang baru dibuat akan disimpan sebagai draf privat secara default.
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal Menyimpan</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Nama Mata Kuliah: *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Manajemen Keuangan / Pemrograman Bisnis"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Kode Mata Kuliah (Opsional):
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: DB234101 / MB1201"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 font-mono"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Biarkan kosong jika belum terverifikasi</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Program Studi:
              </label>
              <select
                value={studyProgram}
                onChange={(e) => setStudyProgram(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="S1 Manajemen Bisnis">S1 Manajemen Bisnis</option>
                <option value="S1 Bisnis Digital">S1 Bisnis Digital</option>
                <option value="Mata Kuliah Bersama">Mata Kuliah Bersama</option>
                <option value="Mata Kuliah Bersama (FDKBD/ITS)">Mata Kuliah Bersama (FDKBD/ITS)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Semester:
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="">(Belum ditentukan)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Beban SKS:
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Tahun Kurikulum / Ajaran:
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="Contoh: Kurikulum 2023 / 2025/2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Deskripsi Singkat / Capaian Pembelajaran:
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan ruang lingkup mata kuliah, pokok bahasan, dan sasaran kompetensi lulusan..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <Link href="/admin">
              <SecondaryButton variant="outline" size="md">
                Batal
              </SecondaryButton>
            </Link>
            <PrimaryButton type="submit" variant="brand" size="md" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan & Lanjutkan ke Editor RPS'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
