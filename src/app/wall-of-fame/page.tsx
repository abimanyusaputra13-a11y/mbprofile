'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeading } from '@/components/ui/PageHeading';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Modal } from '@/components/ui/Modal';
import { SimulationNotice } from '@/components/ui/SimulationNotice';
import { AchievementCard } from '@/components/cards/AchievementCard';
import { Badge } from '@/components/ui/Badge';
import {
  mockAchievements,
  ACHIEVEMENT_CATEGORIES_LIST,
  ACHIEVEMENT_YEARS_LIST,
} from '@/data/achievements';
import { Achievement } from '@/types';
import {
  Trophy,
  Award,
  Sparkles,
  Users,
  GraduationCap,
  Calendar,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';

export default function WallOfFamePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedYear, setSelectedYear] = useState('Semua Tahun');

  // Modals
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filteredAchievements = useMemo(() => {
    return mockAchievements.filter((ach) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ach.title.toLowerCase().includes(q) ||
        ach.eventOrganizer.toLowerCase().includes(q) ||
        ach.members.some((m) => m.toLowerCase().includes(q)) ||
        (ach.teamName && ach.teamName.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'Semua Kategori' || ach.category === selectedCategory;

      const matchesYear =
        selectedYear === 'Semua Tahun' || ach.year.toString() === selectedYear;

      return matchesSearch && matchesCategory && matchesYear;
    });
  }, [searchQuery, selectedCategory, selectedYear]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua Kategori');
    setSelectedYear('Semua Tahun');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'Semua Kategori' ||
    selectedYear !== 'Semua Tahun';

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* =========================================================================
          PAGE HEADER
         ========================================================================= */}
      <section className="relative overflow-hidden border-b border-neutral-200/80">
        <PageContainer>
          <PageHeading
            titlePrefix="Wall of"
            accentWord="Fame"
            description="Etalase apresiasi dedikasi, kejuaraan kompetisi, kepemimpinan, serta capaian prestasi terbaik mahasiswa Departemen Manajemen Bisnis ITS."
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton
                variant="yellow"
                size="sm"
                icon={<PlusCircle className="size-3.5" />}
                onClick={() => {
                  setSubmitSuccess(false);
                  setIsSubmitModalOpen(true);
                }}
              >
                Laporkan Prestasi Mahasiswa
              </PrimaryButton>
            </div>
          </PageHeading>
        </PageContainer>
      </section>

      {/* =========================================================================
          SAMPLE DATA DISCLAIMER BANNER
         ========================================================================= */}
      <section>
        <PageContainer>
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
            <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">
                Pemberitahuan Sumber Rekor Prestasi:
              </p>
              <p className="text-amber-800/90 mt-0.5 leading-relaxed">
                Entri pencapaian mahasiswa pada laman ini bersumber dari register resmi Mahasiswa Berprestasi Departemen Manajemen Bisnis ITS (its.ac.id/mb/mahasiswa/mahasiswa-berprestasi/). Rekor mencakup capaian tingkat nasional dan internasional terpilih periode 2024–2026.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          FILTER & SEARCH CONTROLS
         ========================================================================= */}
      <section>
        <PageContainer>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
            <div className="max-w-2xl">
              <label htmlFor="search-achievements" className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Pencarian Prestasi
              </label>
              <SearchInput
                id="search-achievements"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari nama kompetisi, nama mahasiswa, tim, atau penyelenggara..."
              />
            </div>

            {/* Category tabs */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                Kategori Prestasi:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Semua Kategori', ...ACHIEVEMENT_CATEGORIES_LIST].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-neutral-900 text-white font-bold shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-neutral-500">Tahun:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 rounded-full px-3 py-1 font-semibold text-neutral-800"
                >
                  {ACHIEVEMENT_YEARS_LIST.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className="text-neutral-400">|</span>
                <span className="text-neutral-500 font-medium">
                  Menampilkan <span className="font-bold text-neutral-900">{filteredAchievements.length}</span> rekor prestasi
                </span>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer self-start sm:self-center"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          ACHIEVEMENT CARDS GRID
         ========================================================================= */}
      <section>
        <PageContainer>
          {filteredAchievements.length === 0 ? (
            <EmptyState
              title="Tidak Ada Prestasi Ditemukan"
              description="Tidak ditemukan entri prestasi yang sesuai dengan kriteria kategori atau tahun yang dipilih."
              onReset={resetFilters}
              resetText="Reset Filter"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((ach) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  onSelect={(item) => setSelectedAchievement(item)}
                />
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      {/* =========================================================================
          DETAIL ACHIEVEMENT MODAL
         ========================================================================= */}
      {selectedAchievement && (
        <Modal
          isOpen={!!selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
          title={selectedAchievement.title}
          subtitle={`${selectedAchievement.award} • ${selectedAchievement.year}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <p className="font-bold text-amber-950 text-sm mb-1">
                Penyelenggara: {selectedAchievement.eventOrganizer}
              </p>
              <p className="text-amber-900/90 text-xs">
                Tingkat: <span className="font-semibold">{selectedAchievement.level}</span> | Kategori: <span className="font-semibold">{selectedAchievement.category}</span>
              </p>
            </div>

            <div>
              <p className="font-bold text-neutral-900 mb-1">Anggota Tim / Mahasiswa Penerima:</p>
              <div className="space-y-1">
                {selectedAchievement.members.map((member, i) => (
                  <p
                    key={i}
                    className="p-2 bg-neutral-50 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-800"
                  >
                    • {member}
                  </p>
                ))}
              </div>
            </div>

            {selectedAchievement.advisor && (
              <div>
                <p className="font-bold text-neutral-900 mb-1">Dosen Pembina:</p>
                <p className="text-neutral-700">{selectedAchievement.advisor}</p>
              </div>
            )}

            <div>
              <p className="font-bold text-neutral-900 mb-1">Deskripsi Karya & Perjuangan:</p>
              <p className="text-neutral-600 leading-relaxed font-light">
                {selectedAchievement.description}
              </p>
            </div>

            <div className="flex justify-end pt-3">
              <SecondaryButton
                variant="outline"
                size="sm"
                onClick={() => setSelectedAchievement(null)}
              >
                Tutup
              </SecondaryButton>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          SUBMIT PRESTASI SIMULATION MODAL
         ========================================================================= */}
      {isSubmitModalOpen && (
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Lapor / Submit Prestasi Mahasiswa"
          subtitle="Form Pendataan Capaian Prestasi Mahasiswa Manajemen Bisnis ITS"
          maxWidth="lg"
        >
          {submitSuccess ? (
            <div className="space-y-4 text-center py-4">
              <div className="grid place-items-center size-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                <CheckCircle className="size-6" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">
                Laporan Prestasi Berhasil Diajukan!
              </h4>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                Terima kasih atas laporan Anda! Data simulasi telah masuk ke antrean verifikasi Kemahasiswaan.
              </p>
              <SimulationNotice
                actionName="Kirim Form Lapor Prestasi"
                backendRequirement="Validasi NIM terdaftar di Database Akademik, upload lampiran sertifikat resmi, dan notifikasi review ke Biro Kemahasiswaan"
              />
              <div className="pt-2">
                <PrimaryButton
                  variant="dark"
                  size="sm"
                  onClick={() => setIsSubmitModalOpen(false)}
                >
                  Selesai
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitSuccess(true);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nama Ajang / Kompetisi / Beasiswa: *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Business Case Competition / Unilever Future Leaders' League"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Kategori: *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {ACHIEVEMENT_CATEGORIES_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Penghargaan / Gelar Juara: *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Juara 1 / 1st Runner-Up / Medali Emas"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nama Mahasiswa & NIM (Tim): *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Charissa Salsabilla Noor, Rachel Putricia"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Unggah Bukti Sertifikat / SK (PDF/JPG, Maks 10MB): *
                </label>
                <input
                  type="file"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white"
                />
              </div>

              <SimulationNotice
                actionName="Simulasi Pelaporan Mandiri Prestasi"
                backendRequirement="Data ini belum disimpan permanen ke server database. Memerlukan autentikasi akun mahasiswa & otorisasi admin."
              />

              <div className="flex justify-end gap-2 pt-2">
                <SecondaryButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSubmitModalOpen(false)}
                >
                  Batal
                </SecondaryButton>
                <PrimaryButton type="submit" variant="brand" size="sm">
                  Kirim Laporan (Simulasi)
                </PrimaryButton>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
