'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeading } from '@/components/ui/PageHeading';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Modal } from '@/components/ui/Modal';
import { AchievementCard } from '@/components/cards/AchievementCard';
import {
  ACHIEVEMENT_CATEGORIES_LIST,
  ACHIEVEMENT_YEARS_LIST,
} from '@/data/achievements';
import { Achievement, AchievementCategory, AchievementLevel } from '@/types';
import { submitAchievementReport } from '@/lib/actions/achievements';
import {
  Trophy,
  Award,
  Users,
  PlusCircle,
  CheckCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface Props {
  initialAchievements: Achievement[];
  isLiveDb: boolean;
}

export function WallOfFameClient({ initialAchievements, isLiveDb }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedYear, setSelectedYear] = useState('Semua Tahun');

  // Modals
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AchievementCategory>('Kompetisi');
  const [award, setAward] = useState('');
  const [members, setMembers] = useState('');
  const [eventOrganizer, setEventOrganizer] = useState('');
  const [level, setLevel] = useState<AchievementLevel>('Nasional');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filteredAchievements = useMemo(() => {
    return initialAchievements.filter((ach) => {
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
  }, [initialAchievements, searchQuery, selectedCategory, selectedYear]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua Kategori');
    setSelectedYear('Semua Tahun');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'Semua Kategori' ||
    selectedYear !== 'Semua Tahun';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('category', category);
      fd.append('award', award);
      fd.append('members', members);
      fd.append('eventOrganizer', eventOrganizer || title);
      fd.append('level', level);
      fd.append('year', year.toString());
      if (file) {
        fd.append('file', file);
      }

      const res = await submitAchievementReport(fd);
      if (res.success) {
        setSubmitSuccess(true);
        setTitle('');
        setAward('');
        setMembers('');
        setEventOrganizer('');
        setFile(null);
        router.refresh();
      } else {
        setSubmitError(res.error || 'Gagal mengirim laporan prestasi.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan pada jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  setSubmitError(null);
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
          FILTER & SEARCH CONTROLS
         ========================================================================= */}
      <section>
        <PageContainer>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-6">
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
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                      selectedCategory === cat
                        ? 'bg-neutral-900 text-white font-bold border-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-neutral-300'
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
              <p className="font-bold text-neutral-900 mb-1">Deskripsi Capaian Prestasi:</p>
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
          SUBMIT PRESTASI FORM MODAL (LIVE INTEGRATION)
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
                Terima kasih atas laporan Anda! Berkas laporan Anda telah tersimpan di sistem dan masuk ke antrean verifikasi admin/kemahasiswaan untuk disetujui sebelum tayang di Wall of Fame.
              </p>
              <div className="pt-2">
                <PrimaryButton
                  variant="dark"
                  size="sm"
                  onClick={() => {
                    setIsSubmitModalOpen(false);
                    setSubmitSuccess(false);
                  }}
                >
                  Selesai
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 text-xs"
            >
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nama Ajang / Kompetisi / Beasiswa: *
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Business Case Competition / Unilever Future Leaders' League"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Kategori: *
                  </label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AchievementCategory)}
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
                    Tingkat Kompetisi: *
                  </label>
                  <select
                    required
                    value={level}
                    onChange={(e) => setLevel(e.target.value as AchievementLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                    <option value="Regional">Regional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Tahun Capaian: *
                  </label>
                  <select
                    required
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {[2026, 2025, 2024, 2023].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Penghargaan / Gelar Juara: *
                  </label>
                  <input
                    required
                    type="text"
                    value={award}
                    onChange={(e) => setAward(e.target.value)}
                    placeholder="Contoh: Juara 1 / 1st Runner-Up / Medali Emas"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Lembaga / Penyelenggara:
                  </label>
                  <input
                    type="text"
                    value={eventOrganizer}
                    onChange={(e) => setEventOrganizer(e.target.value)}
                    placeholder="Contoh: Puspresnas / SPE Undip SC"
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
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  placeholder="Contoh: Charissa Salsabilla Noor (5012211001), Rachel Putricia"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Unggah Bukti Sertifikat / SK (PDF/JPG/PNG, Maks 10MB):
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <SecondaryButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSubmitModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </SecondaryButton>
                <PrimaryButton type="submit" variant="brand" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Mengirim Laporan...' : 'Kirim Laporan Prestasi'}
                </PrimaryButton>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
