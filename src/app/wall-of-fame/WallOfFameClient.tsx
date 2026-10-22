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
import {
  submitAchievementReport,
  getCertificateDownloadUrl,
} from '@/lib/actions/achievements';
import { Badge } from '@/components/ui/Badge';
import {
  Trophy,
  Award,
  Users,
  PlusCircle,
  CheckCircle,
  RotateCcw,
  Sparkles,
  GraduationCap,
  FileCheck,
  Image as ImageIcon,
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
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<AchievementLevel>('Nasional');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [file, setFile] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
      if (description.trim()) {
        fd.append('description', description.trim());
      }
      if (file) {
        fd.append('file', file);
      }
      if (photo) {
        fd.append('photo', photo);
      }

      const res = await submitAchievementReport(fd);
      if (res.success) {
        setSubmitSuccess(true);
        setTitle('');
        setAward('');
        setMembers('');
        setEventOrganizer('');
        setDescription('');
        setFile(null);
        setPhoto(null);
        setPhotoPreview(null);
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          DETAIL ACHIEVEMENT MODAL (SEAMLESS UNIFIED PRESENTATION)
         ========================================================================= */}
      {selectedAchievement && (
        <Modal
          isOpen={!!selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
          title="Detail Capaian Prestasi"
          maxWidth="4xl"
          titleClassName="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight translate-y-1 sm:translate-y-1.5"
          headerClassName="px-6 py-5 sm:px-8 sm:py-6 bg-white"
          bodyClassName="p-6 sm:p-8"
        >
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Sisi Kiri: Foto Dokumentasi Prestasi */}
            <div className="w-full md:w-[36%] shrink-0">
              <div className="w-full aspect-4/3 rounded-2xl overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_#000] bg-neutral-900 relative flex items-center justify-center">
                {selectedAchievement.photoUrl ? (
                  <img
                    src={selectedAchievement.photoUrl}
                    alt={selectedAchievement.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative">
                    <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 mb-2 shadow-inner">
                      <Trophy className="size-7 text-amber-400 drop-shadow" />
                    </div>
                    <p className="text-xs font-bold text-neutral-200 tracking-wide">Dokumentasi Prestasi</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Departemen MB ITS</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sisi Kanan: Tulisan Pendukung (Memanjang & Tidak Padat) */}
            <div className="flex-1 min-w-0 space-y-4 text-xs sm:text-sm">
              {/* Pencapaian (Nama Ajang) ditulis tebal di samping foto */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug">
                  {selectedAchievement.title}
                </h3>
                {/* Penyelenggara di bawahnya dengan font lebih kecil warna abu-abu */}
                <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
                  Penyelenggara: {selectedAchievement.eventOrganizer}
                </p>
              </div>

              {/* Rincian Anggota Tim & Nama Mahasiswa */}
              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <p className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Users className="size-4 text-blue-600" />
                  <span>Anggota Tim &amp; Mahasiswa Penerima:</span>
                </p>
                {selectedAchievement.teamName && (
                  <p className="text-xs font-bold text-blue-600 flex items-center gap-1.5 pl-1">
                    <Sparkles className="size-3.5" />
                    <span>Tim: {selectedAchievement.teamName}</span>
                  </p>
                )}
                <ul className="space-y-1.5 pl-1">
                  {selectedAchievement.members.map((member, i) => (
                    <li key={i} className="text-xs sm:text-sm text-neutral-700 flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span className="font-medium">{member}</span>
                    </li>
                  ))}
                </ul>
                {selectedAchievement.advisor && (
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 pt-1 pl-1">
                    <GraduationCap className="size-3.5 text-neutral-400 shrink-0" />
                    <span>Dosen Pembina: {selectedAchievement.advisor}</span>
                  </div>
                )}
              </div>

              {/* Deskripsi Capaian Prestasi - teks warna hitam saja dengan ukuran font sedikit lebih kecil */}
              {selectedAchievement.description && (
                <div className="pt-3 border-t border-neutral-100">
                  <p className="font-bold text-neutral-900 mb-1.5 text-xs sm:text-sm">Deskripsi Capaian Prestasi:</p>
                  <p className="text-xs sm:text-sm text-neutral-800 font-normal leading-relaxed whitespace-pre-wrap">
                    {selectedAchievement.description}
                  </p>
                </div>
              )}

              {/* Bukti Sertifikat / SK (Jika ada) */}
              {selectedAchievement.certificateStorageKey && (
                <div className="pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await getCertificateDownloadUrl(selectedAchievement.certificateStorageKey!);
                      if (res.url) window.open(res.url, '_blank');
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 cursor-pointer"
                  >
                    <FileCheck className="size-3.5 text-blue-600" />
                    <span>Lihat / Unduh Bukti Sertifikat / SK</span>
                  </button>
                </div>
              )}
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
                  placeholder="Contoh: Business Case"
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
                    placeholder="Contoh: Juara 1"
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
                    placeholder="Contoh: Puspresnas"
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
                  placeholder="Contoh: Charissa Salsabilla Noor (5012211001)"
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

              {/* Dua bagian opsional diletakkan di bagian paling bawah */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-700">
                    Deskripsi Capaian Prestasi:
                  </label>
                  <span className="text-[11px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                    Opsional
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Merancang strategi digitalisasi supply chain terintegrasi untuk UMKM lokal serta berhasil mempresentasikan studi kasus di hadapan panel juri industri hingga mengungguli 85 tim universitas."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 text-xs leading-relaxed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-700 flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-blue-600" />
                    <span>Foto Dokumentasi Kegiatan / Penyerahan Juara:</span>
                  </label>
                  <span className="text-[11px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                    Opsional
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setPhoto(f);
                    if (f) {
                      setPhotoPreview(URL.createObjectURL(f));
                    } else {
                      setPhotoPreview(null);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white"
                />
                {photoPreview && (
                  <div className="mt-2.5 relative inline-block">
                    <img
                      src={photoPreview}
                      alt="Pratinjau Dokumentasi"
                      className="w-36 h-24 object-cover rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute -top-2 -right-2 size-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow hover:bg-rose-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-neutral-500 mt-1">
                  Format JPG, PNG, atau WEBP (Maks 10MB). Foto ini akan ditampilkan di sisi kiri kartu prestasi Anda.
                </p>
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
