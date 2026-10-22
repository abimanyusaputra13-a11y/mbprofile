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
import { LecturerCard } from '@/components/cards/LecturerCard';
import { Badge } from '@/components/ui/Badge';
import { Lecturer } from '@/types';
import { getLecturerPhotoUrl, getLecturerInitials, getLecturerInterests } from '@/lib/lecturers';
import {
  GraduationCap,
  Mail,
  MapPin,
  BookOpen,
  Award,
  Calendar,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Globe,
} from 'lucide-react';

interface DaftarDosenClientProps {
  initialLecturers: Lecturer[];
  isLiveDb: boolean;
  initialError?: string;
}

const CATEGORY_OPTIONS = [
  'Semua Kategori',
  'Pimpinan Departemen',
  'Dosen Pengajar',
];

export function DaftarDosenClient({
  initialLecturers,
  isLiveDb,
}: DaftarDosenClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedInterest, setSelectedInterest] = useState('Semua Minat Penelitian');

  // Detail Modal
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [modalImageError, setModalImageError] = useState(false);
  const [isScheduleBookingOpen, setIsScheduleBookingOpen] = useState(false);

  // Compute all distinct research interests from dataset
  const allInterests = useMemo(() => {
    const set = new Set<string>();
    for (const lec of initialLecturers) {
      const list = getLecturerInterests(lec);
      for (const item of list) {
        if (item && item.trim()) {
          set.add(item.trim());
        }
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [initialLecturers]);

  // Filtered lecturers
  const filteredLecturers = useMemo(() => {
    return initialLecturers.filter((lec) => {
      const q = searchQuery.toLowerCase().trim();
      const interests = getLecturerInterests(lec);
      const role = lec.position || lec.rank || '';

      const matchesSearch =
        !q ||
        lec.name.toLowerCase().includes(q) ||
        (lec.nip ? lec.nip.includes(q) : false) ||
        role.toLowerCase().includes(q) ||
        interests.some((i) => i.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'Semua Kategori' ||
        (selectedCategory === 'Pimpinan Departemen' && (lec.position || lec.rank === 'Pimpinan Departemen')) ||
        (selectedCategory === 'Dosen Pengajar' && !lec.position && lec.rank !== 'Pimpinan Departemen');

      const matchesInterest =
        selectedInterest === 'Semua Minat Penelitian' ||
        interests.includes(selectedInterest);

      return matchesSearch && matchesCategory && matchesInterest;
    });
  }, [initialLecturers, searchQuery, selectedCategory, selectedInterest]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua Kategori');
    setSelectedInterest('Semua Minat Penelitian');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'Semua Kategori' ||
    selectedInterest !== 'Semua Minat Penelitian';

  // Modal active lecturer
  const modalPhotoUrl = selectedLecturer ? getLecturerPhotoUrl(selectedLecturer) : null;
  const modalInitials = selectedLecturer ? getLecturerInitials(selectedLecturer.name) : 'DS';
  const modalInterests = selectedLecturer ? getLecturerInterests(selectedLecturer) : [];

  const modalScholar = selectedLecturer?.google_scholar_url || selectedLecturer?.googleScholarUrl;
  const modalScopus = selectedLecturer?.scopus_url || selectedLecturer?.scopusUrl;

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* =========================================================================
          PAGE HEADER
         ========================================================================= */}
      <section className="relative overflow-hidden border-b border-neutral-200/80">
        <PageContainer>
          <PageHeading
            badge="Profil Dosen & Minat Riset MB-ITS"
            badgeVariant="yellow"
            titlePrefix="Direktori"
            accentWord="Dosen"
            titleSuffix="Manajemen Bisnis ITS"
            description="Mengenal jajaran dosen, pimpinan departemen, fokus riset penelitian, dan publikasi ilmiah resmi Departemen Manajemen Bisnis, Institut Teknologi Sepuluh Nopember (ITS)."
          />

          {/* Source Attribution & Data Badge */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>{isLiveDb ? 'Data Terhubung Langsung ke Supabase' : 'Data Lokal Terverifikasi'}</span>
            </span>

            <a
              href="https://www.its.ac.id/mb/dosen-staff/daftar-dosen/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-blue-600 transition underline underline-offset-2"
            >
              <Globe className="size-3.5 text-neutral-400" />
              <span>Sumber Resmi: its.ac.id/mb/dosen-staff</span>
              <ExternalLink className="size-2.5 opacity-60" />
            </a>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          FILTER CONTROLS
         ========================================================================= */}
      <section>
        <PageContainer>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
            <div className="max-w-2xl">
              <label
                htmlFor="search-lecturers"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2"
              >
                Pencarian Profil Dosen, NIP, atau Topik Riset
              </label>
              <SearchInput
                id="search-lecturers"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari nama dosen, gelar, NIP, atau topik minat riset..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
              <FilterSelect
                id="filter-category"
                label="Kategori / Peran"
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={CATEGORY_OPTIONS}
              />

              <FilterSelect
                id="filter-interest"
                label="Bidang Minat Riset"
                value={selectedInterest}
                onChange={setSelectedInterest}
                options={['Semua Minat Penelitian', ...allInterests]}
              />
            </div>

            {/* Popular Topics Quick Filters */}
            <div className="pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="font-semibold text-neutral-400 shrink-0">Topik Populer:</span>
                {[
                  'Entrepreneurial marketing',
                  'Strategic Management',
                  'Digital Business',
                  'Marketing Management',
                  'Supply Chain Management',
                  'Simulasi Bisnis',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (selectedInterest === tag) {
                        setSelectedInterest('Semua Minat Penelitian');
                      } else {
                        setSelectedInterest(tag);
                      }
                    }}
                    className={`px-3 py-1 rounded-full font-medium transition cursor-pointer shrink-0 border ${
                      selectedInterest === tag
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
              <span className="text-neutral-500 font-medium">
                Ditemukan <span className="font-bold text-neutral-900">{filteredLecturers.length}</span> profil dosen
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
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
          LECTURERS DIRECTORY GRID
         ========================================================================= */}
      <section>
        <PageContainer>
          {filteredLecturers.length === 0 ? (
            <EmptyState
              title="Profil Dosen Tidak Ditemukan"
              description="Tidak ada profil dosen yang sesuai dengan kriteria filter atau kata kunci pencarian Anda."
              onReset={resetFilters}
              resetText="Bersihkan Filter"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLecturers.map((lec) => (
                <LecturerCard
                  key={lec.id}
                  lecturer={lec}
                  onSelect={(lecturer) => {
                    setModalImageError(false);
                    setSelectedLecturer(lecturer);
                  }}
                />
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      {/* =========================================================================
          LECTURER DETAIL PROFILE MODAL
         ========================================================================= */}
      {selectedLecturer && (
        <Modal
          isOpen={!!selectedLecturer}
          onClose={() => {
            setSelectedLecturer(null);
            setIsScheduleBookingOpen(false);
          }}
          title={selectedLecturer.name}
          subtitle={selectedLecturer.position || selectedLecturer.rank || 'Dosen Pengajar MB-ITS'}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs sm:text-sm text-neutral-700">
            {/* Header Portrait & Bio Container */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white rounded-3xl border border-blue-200/80 shadow-xs">
              <div className="relative size-24 sm:size-28 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 ring-4 ring-white shadow-md border border-neutral-200">
                {modalPhotoUrl && !modalImageError ? (
                  <img
                    src={modalPhotoUrl}
                    alt={selectedLecturer.name}
                    className="w-full h-full object-cover object-top"
                    onError={() => setModalImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white font-bold text-2xl shadow-inner">
                    {modalInitials}
                  </div>
                )}
              </div>

              <div className="space-y-2 min-w-0 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <Badge variant="brand" size="sm">
                    {selectedLecturer.position || selectedLecturer.rank || 'Dosen Pengajar'}
                  </Badge>
                  {selectedLecturer.laboratory && (
                    <Badge variant="yellow" size="sm">
                      {selectedLecturer.laboratory}
                    </Badge>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                  {selectedLecturer.name}
                </h3>

                {selectedLecturer.nip && (
                  <p className="text-xs text-neutral-600 font-mono">
                    <span className="font-semibold text-neutral-500">NIP:</span> {selectedLecturer.nip}
                  </p>
                )}

                {selectedLecturer.office && (
                  <p className="text-xs text-neutral-600 flex items-center justify-center sm:justify-start gap-1.5">
                    <MapPin className="size-3.5 text-neutral-400 shrink-0" />
                    <span>{selectedLecturer.office}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Minat Penelitian / Research Interests */}
            {modalInterests.length > 0 && (
              <div>
                <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Award className="size-4 text-blue-600" />
                  <span>Bidang Minat Riset & Keahlian (Research Interests)</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {modalInterests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-blue-50/80 text-blue-900 border border-blue-200/90 text-xs font-medium flex items-center gap-1.5"
                    >
                      <span className="size-1.5 rounded-full bg-blue-600" />
                      <span>{interest}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Profiles & External Links */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
              <h4 className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
                <GraduationCap className="size-4 text-neutral-700" />
                <span>Tautan Profil Publikasi Ilmiah Resmi</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {modalScholar ? (
                  <a
                    href={modalScholar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:shadow-xs transition text-blue-700 group"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="size-4 text-blue-600" />
                      <div>
                        <p className="font-bold text-xs text-neutral-900 group-hover:text-blue-600">Google Scholar</p>
                        <p className="text-[10px] text-neutral-500">Lihat sitasi & daftar publikasi</p>
                      </div>
                    </div>
                    <ExternalLink className="size-3.5 text-neutral-400 group-hover:text-blue-600" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-neutral-100/70 border border-neutral-200 text-neutral-400 text-xs">
                    <p className="font-semibold">Google Scholar</p>
                    <p className="text-[10px]">Tautan belum tercantum di direktori</p>
                  </div>
                )}

                {modalScopus ? (
                  <a
                    href={modalScopus}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-xs transition text-amber-800 group"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-4 text-amber-600" />
                      <div>
                        <p className="font-bold text-xs text-neutral-900 group-hover:text-amber-700">Scopus Profile</p>
                        <p className="text-[10px] text-neutral-500">Indeksasi internasional Scopus</p>
                      </div>
                    </div>
                    <ExternalLink className="size-3.5 text-neutral-400 group-hover:text-amber-700" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-neutral-100/70 border border-neutral-200 text-neutral-400 text-xs">
                    <p className="font-semibold">Scopus Profile</p>
                    <p className="text-[10px]">Tautan belum tercantum di direktori</p>
                  </div>
                )}
              </div>

              {/* Official ITS Source Attribution */}
              <div className="pt-2 text-[11px] text-neutral-500 flex items-center justify-between">
                <span>Sumber: Institut Teknologi Sepuluh Nopember (ITS)</span>
                {selectedLecturer.detail_page_url ? (
                  <a
                    href={selectedLecturer.detail_page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Laman ITS Dosen</span>
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <a
                    href="https://www.its.ac.id/mb/dosen-staff/daftar-dosen/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>its.ac.id/mb</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Consultation Service Drawer */}
            {isScheduleBookingOpen ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Calendar className="size-4 text-amber-600" />
                  <span>Jadwal Konsultasi & Layanan Departemen</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Layanan administrasi dan konsultasi departemen: Senin – Jumat pukul 08.00 – 16.30 WIB di Departemen Manajemen Bisnis ITS, Sukolilo, Surabaya.
                </p>
                <SimulationNotice
                  actionName="Booking Jadwal Konsultasi Mahasiswa"
                  backendRequirement="Integrasi kalender akademik myITS dengan validasi akun mahasiswa ITS"
                />
              </div>
            ) : null}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              {selectedLecturer.email ? (
                <a
                  href={`mailto:${selectedLecturer.email}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                >
                  <Mail className="size-4" />
                  <span>{selectedLecturer.email}</span>
                </a>
              ) : (
                <span className="text-xs text-neutral-500">Departemen Manajemen Bisnis ITS</span>
              )}

              <div className="flex gap-2">
                <SecondaryButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduleBookingOpen(!isScheduleBookingOpen)}
                  icon={<Calendar className="size-3.5" />}
                >
                  {isScheduleBookingOpen ? 'Tutup Jadwal' : 'Lihat Jadwal Layanan'}
                </SecondaryButton>
                <PrimaryButton
                  variant="dark"
                  size="sm"
                  onClick={() => {
                    setSelectedLecturer(null);
                    setIsScheduleBookingOpen(false);
                  }}
                >
                  Tutup
                </PrimaryButton>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
