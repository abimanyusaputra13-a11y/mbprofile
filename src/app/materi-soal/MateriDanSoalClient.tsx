'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeading } from '@/components/ui/PageHeading';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Modal } from '@/components/ui/Modal';
import { SimulationNotice } from '@/components/ui/SimulationNotice';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { mockResources, RESOURCE_TYPES_LIST, ACADEMIC_YEARS_LIST } from '@/data/resources';
import { Resource } from '@/types';
import { CourseWithDetails } from '@/types/course';
import { mapCoursesToResources } from '@/lib/utils/resourceMapper';
import { getAttachmentDownloadUrl } from '@/lib/actions/courses';
import {
  Upload,
  Download,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Database,
  FileText,
  Percent,
  ListOrdered,
  BookOpen,
  ChevronRight,
  Award,
} from 'lucide-react';

interface MateriDanSoalClientProps {
  initialCourses: CourseWithDetails[];
  initialError?: string;
  isLiveDb: boolean;
}

export function MateriDanSoalClient({
  initialCourses,
  initialError,
  isLiveDb,
}: MateriDanSoalClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Determine active dataset
  // When live DB is connected, only use live data. If unconfigured, use mockResources with clear notice.
  const allResources: Resource[] = useMemo(() => {
    if (isLiveDb) {
      return mapCoursesToResources(initialCourses);
    }
    return mockResources;
  }, [isLiveDb, initialCourses]);

  // Dynamic course options based on active resources
  const courseOptions = useMemo(() => {
    const names = Array.from(new Set(allResources.map((r) => r.courseName))).filter(Boolean);
    names.sort((a, b) => a.localeCompare(b));
    return ['Semua Mata Kuliah', ...names];
  }, [allResources]);

  // Dynamic academic year options
  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(allResources.map((r) => r.academicYear))).filter(Boolean);
    years.sort((a, b) => b.localeCompare(a));
    return ['Semua Tahun', ...years];
  }, [allResources]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Semua');
  const [selectedCourse, setSelectedCourse] = useState('Semua Mata Kuliah');
  const [selectedType, setSelectedType] = useState('Semua Tipe');
  const [selectedYear, setSelectedYear] = useState('Semua Tahun');

  // Modals
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [downloadModalResource, setDownloadModalResource] = useState<Resource | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Filtered dataset
  const filteredResources = useMemo(() => {
    return allResources.filter((res) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        res.title.toLowerCase().includes(q) ||
        res.courseCode.toLowerCase().includes(q) ||
        res.courseName.toLowerCase().includes(q) ||
        res.author.toLowerCase().includes(q) ||
        res.tags.some((t) => t.toLowerCase().includes(q));

      // Semester
      const matchesSemester =
        selectedSemester === 'Semua' || res.semester.toString() === selectedSemester;

      // Course
      const matchesCourse =
        selectedCourse === 'Semua Mata Kuliah' || res.courseName === selectedCourse;

      // Type
      const matchesType = selectedType === 'Semua Tipe' || res.type === selectedType;

      // Year
      const matchesYear =
        selectedYear === 'Semua Tahun' || res.academicYear === selectedYear;

      return matchesSearch && matchesSemester && matchesCourse && matchesType && matchesYear;
    });
  }, [allResources, searchQuery, selectedSemester, selectedCourse, selectedType, selectedYear]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedSemester('Semua');
    setSelectedCourse('Semua Mata Kuliah');
    setSelectedType('Semua Tipe');
    setSelectedYear('Semua Tahun');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedSemester !== 'Semua' ||
    selectedCourse !== 'Semua Mata Kuliah' ||
    selectedType !== 'Semua Tipe' ||
    selectedYear !== 'Semua Tahun';

  // Real secure attachment download handler
  const handleRealDownload = async (resource: Resource) => {
    if (!resource.attachmentId) {
      // If it's a summary or mock, open download modal / fallback
      setDownloadModalResource(resource);
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const res = await getAttachmentDownloadUrl(resource.attachmentId);
      if (res.error || !res.url) {
        setDownloadError(res.error || 'Gagal membuat tautan unduhan aman.');
        setDownloadModalResource(resource);
      } else {
        // Direct browser to signed URL
        const a = document.createElement('a');
        a.href = res.url;
        a.download = resource.title;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunduh berkas.';
      setDownloadError(msg);
      setDownloadModalResource(resource);
    } finally {
      setIsDownloading(false);
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
            titlePrefix="Materi &"
            accentWord="Bank Soal"
            description="Pusat kurasi sumber belajar: kumpulan catatan kuliah, slide dosen, modul praktikum, dan arsip Ujian Tengah/Akhir Semester."
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton
                variant="brand"
                size="sm"
                icon={<Upload className="size-3.5" />}
                onClick={() => {
                  setUploadSuccess(false);
                  setIsUploadModalOpen(true);
                }}
              >
                Kontribusi / Unggah Materi
              </PrimaryButton>
            </div>
          </PageHeading>
        </PageContainer>
      </section>

      {/* =========================================================================
          ENVIRONMENT & STATUS BANNER (CLEAR MOCK vs LIVE SEPARATION)
         ========================================================================= */}
      <PageContainer>
        {!isLiveDb && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-900 text-xs">
            <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Mode Simulasi Pengembangan Lokal</p>
              <p className="text-amber-800/90 mt-0.5 leading-relaxed">
                Menampilkan data simulasi lokal karena kredensial Supabase (<code>NEXT_PUBLIC_SUPABASE_URL</code> &amp; <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) belum dikonfigurasi di lingkungan ini. Hubungkan akun Supabase Anda untuk menampilkan materi publik secara langsung dari database produksi.
              </p>
            </div>
          </div>
        )}

        {isLiveDb && initialError && (
          <div className="flex items-start justify-between gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-950 text-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-950 text-sm">Gagal Terhubung ke Database Supabase</p>
                <p className="text-red-800/90 mt-1 leading-relaxed">
                  Terjadi kendala saat mengambil materi kuliah langsung dari server: <span className="font-mono text-red-900">{initialError}</span>.
                </p>
                <p className="text-red-700/80 mt-1 text-[11px]">
                  Sesuai kebijakan integritas data, sistem tidak menampilkan data usang atau mock secara diam-diam. Silakan coba kembali.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => startTransition(() => router.refresh())}
              disabled={isPending}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isPending ? 'Memuat Ulang...' : 'Coba Lagi'}
            </button>
          </div>
        )}
      </PageContainer>

      {/* If error on live DB, do not display mock data or stale cards */}
      {isLiveDb && initialError ? (
        <section>
          <PageContainer>
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Koneksi Database Bermasalah</h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto mt-2">
                Tidak dapat menampilkan materi publik saat ini. Mohon periksa status proyek Supabase atau coba beberapa saat lagi.
              </p>
              <div className="mt-6">
                <PrimaryButton
                  variant="brand"
                  size="sm"
                  onClick={() => startTransition(() => router.refresh())}
                  disabled={isPending}
                >
                  <RotateCcw className="size-3.5 mr-2" />
                  {isPending ? 'Memperbarui...' : 'Muat Ulang Halaman'}
                </PrimaryButton>
              </div>
            </div>
          </PageContainer>
        </section>
      ) : (
        <>
          {/* =========================================================================
              BANNER: DIRECT LINK TO INTERACTIVE WEEKLY COURSES & QUIZZES
             ========================================================================= */}
          <section className="mb-2">
            <PageContainer>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-md">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950 px-2.5 py-0.5 rounded-full">
                      Sistem Pembelajaran Mingguan
                    </span>
                    <span className="text-xs text-blue-200">Silabus, Dokumen &amp; Kuis Interaktif</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Akses Materi Teks, Berkas Dosen, dan Kuis Evaluasi per Minggu
                  </h3>
                  <p className="text-xs text-blue-100/90 leading-relaxed max-w-2xl">
                    Setiap mata kuliah Departemen MB ITS kini terstruktur dalam minggu perkuliahan. Anda dapat mempelajari bahan bacaan, mengunduh salindia kuliah, dan mengerjakan kuis evaluasi otomatis untuk menguji pemahaman materi.
                  </p>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-blue-950 font-bold text-xs hover:bg-amber-300 hover:text-neutral-950 transition shadow-sm shrink-0 self-start sm:self-center"
                >
                  <BookOpen className="size-4 text-blue-600" />
                  <span>Buka Direktori Mata Kuliah</span>
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </PageContainer>
          </section>

          {/* =========================================================================
              FILTER & CONTROLS SECTION
             ========================================================================= */}
          <section>
            <PageContainer>
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
                {/* Search Bar */}
                <div className="max-w-2xl">
                  <label htmlFor="search-materials" className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Pencarian Cepat
                  </label>
                  <SearchInput
                    id="search-materials"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Cari judul materi, kode kuliah (cth: MB/BD), nama dosen, atau tag..."
                  />
                </div>

                {/* Filter Dropdowns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-neutral-100">
                  <FilterSelect
                    id="filter-semester"
                    label="Semester"
                    value={selectedSemester}
                    onChange={setSelectedSemester}
                    options={['Semua', '1', '2', '3', '4', '5', '6', '7', '8']}
                  />

                  <FilterSelect
                    id="filter-type"
                    label="Tipe Berkas"
                    value={selectedType}
                    onChange={setSelectedType}
                    options={['Semua Tipe', ...RESOURCE_TYPES_LIST]}
                  />

                  <FilterSelect
                    id="filter-course"
                    label="Mata Kuliah"
                    value={selectedCourse}
                    onChange={setSelectedCourse}
                    options={courseOptions}
                  />

                  <FilterSelect
                    id="filter-year"
                    label="Tahun Ajaran"
                    value={selectedYear}
                    onChange={setSelectedYear}
                    options={yearOptions.length > 1 ? yearOptions : ACADEMIC_YEARS_LIST}
                  />
                </div>

                {/* Quick Pills & Active Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-500">Shortcut Tipe:</span>
                    {['Semua Tipe', 'Soal UTS', 'Soal UAS', 'Catatan Kuliah', 'Slide Dosen'].map(
                      (t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedType(t)}
                          className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                            selectedType === t
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {t}
                        </button>
                      )
                    )}
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer self-start sm:self-center"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Reset Semua Filter</span>
                    </button>
                  )}
                </div>
              </div>
            </PageContainer>
          </section>

          {/* =========================================================================
              RESOURCES GRID & EMPTY STATE
             ========================================================================= */}
          <section>
            <PageContainer>
              <div className="flex items-center justify-between gap-4 mb-6">
                <p className="text-sm text-neutral-500 font-medium">
                  Menampilkan <span className="font-bold text-neutral-900">{filteredResources.length}</span> materi dari total {allResources.length} koleksi
                  {isLiveDb && <span className="ml-2 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Database Aktif</span>}
                </p>
              </div>

              {filteredResources.length === 0 ? (
                <EmptyState
                  title={
                    isLiveDb && allResources.length === 0
                      ? 'Belum Ada Materi yang Dipublikasikan'
                      : 'Tidak Ada Materi yang Cocok'
                  }
                  description={
                    isLiveDb && allResources.length === 0
                      ? 'Administrator belum mempublikasikan materi atau mata kuliah ke repositori terbuka. Silakan login ke dashboard admin untuk mengelola publikasi.'
                      : 'Tidak ditemukan bahan ajar atau soal yang sesuai dengan kombinasi filter dan kata kunci pencarian Anda.'
                  }
                  onReset={allResources.length > 0 ? resetAllFilters : undefined}
                  resetText={allResources.length > 0 ? 'Bersihkan Filter Pencarian' : undefined}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      onPreview={(res) => setPreviewResource(res)}
                      onDownload={(res) => handleRealDownload(res)}
                    />
                  ))}
                </div>
              )}
            </PageContainer>
          </section>
        </>
      )}

      {/* =========================================================================
          PREVIEW MODAL (ADAPTS TO LIVE COURSE / SUMMARY / ATTACHMENT)
         ========================================================================= */}
      {previewResource && (
        <Modal
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
          title={`Pratinjau Materi: ${previewResource.courseCode}`}
          subtitle={previewResource.courseName}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200/70">
              <h4 className="font-bold text-blue-950 text-base mb-1">
                {previewResource.title}
              </h4>
              <p className="text-xs text-blue-900/80 leading-relaxed">
                {previewResource.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-400 block text-[10px]">Tipe Berkas</span>
                <span className="font-bold text-neutral-800">{previewResource.type}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-400 block text-[10px]">Format & Ukuran</span>
                <span className="font-bold text-neutral-800">
                  {previewResource.fileFormat} ({previewResource.fileSize})
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-400 block text-[10px]">Tahun Akademik</span>
                <span className="font-bold text-neutral-800">{previewResource.academicYear}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-400 block text-[10px]">Semester</span>
                <span className="font-bold text-neutral-800">Semester {previewResource.semester}</span>
              </div>
            </div>

            {/* If live summary is present, display full summary content */}
            {previewResource.summaryContent ? (
              <div className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50 text-neutral-800 text-xs space-y-3 max-h-64 overflow-y-auto">
                <div className="flex items-center gap-2 text-blue-600 font-bold border-b border-neutral-200 pb-2">
                  <FileText className="w-4 h-4" />
                  <span>Konten Rangkuman Resmi</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-neutral-700">
                  {previewResource.summaryContent}
                </div>
              </div>
            ) : previewResource.courseDetails ? (
              /* If course overview or attachment, display syllabus & weekly modules */
              (() => {
                const details = previewResource.courseDetails as CourseWithDetails;
                return (
                  <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50 text-xs space-y-3 max-h-72 overflow-y-auto">
                    {details.assessments && details.assessments.length > 0 && (
                      <div>
                        <h5 className="font-bold text-neutral-800 mb-1 flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-blue-600" />
                          Komponen Evaluasi:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {details.assessments.map((a) => (
                            <span key={a.id} className="bg-white px-2.5 py-1 rounded-lg border border-neutral-200 font-medium">
                              {a.component_name}: {a.percentage !== null ? `${a.percentage}%` : 'TBD'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {details.weekly_topics && details.weekly_topics.length > 0 && (
                      <div className="pt-2 border-t border-neutral-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-neutral-800 flex items-center gap-1.5">
                            <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
                            Rencana Pembelajaran Mingguan &amp; Kuis:
                          </h5>
                          <Link
                            href={`/courses/${details.id}`}
                            className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Lihat Semua</span>
                            <ChevronRight className="size-3" />
                          </Link>
                        </div>
                        <div className="space-y-1.5">
                          {details.weekly_topics.map((t) => (
                            <Link
                              key={t.id}
                              href={`/courses/${details.id}/weeks/${t.id}`}
                              className="group flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200 hover:border-blue-400 hover:shadow-xs transition"
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md shrink-0">
                                  Mg {t.week_number}
                                </span>
                                <span className="font-medium text-xs text-neutral-800 truncate group-hover:text-blue-600 transition-colors">
                                  {t.topic_title}
                                </span>
                              </div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:text-blue-800 shrink-0">
                                <span>Akses Modul &amp; Kuis</span>
                                <ChevronRight className="size-3" />
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              /* Fallback document preview snippet */
              <div className="border border-neutral-200 rounded-2xl p-5 bg-neutral-900 text-neutral-100 font-mono text-xs space-y-2">
                <p className="text-neutral-400">&#47;&#47; Preview Dokumen:</p>
                <p className="text-emerald-400"># {previewResource.title}</p>
                <p className="text-neutral-300">Penulis: {previewResource.author}</p>
                <p className="text-neutral-300">Tanggal Kurasi: {previewResource.uploadedAt}</p>
                <p className="text-blue-400">[Dilindungi Lisensi Akademik Manajemen Bisnis ITS]</p>
              </div>
            )}

            {!isLiveDb && (
              <SimulationNotice
                actionName="Viewer Berkas Terenkripsi"
                backendRequirement="Integrasi Cloudflare R2 / Supabase Storage presigned viewer dengan watermarking dokumen mahasiswa"
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
              <div>
                {previewResource.weeklyTopicId && previewResource.courseId ? (
                  <Link
                    href={`/courses/${previewResource.courseId}/weeks/${previewResource.weeklyTopicId}`}
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
                  >
                    <BookOpen className="size-3.5" />
                    <span>Akses Modul &amp; Kuis (Mg {previewResource.weekNumber || 1})</span>
                    <ChevronRight className="size-3" />
                  </Link>
                ) : previewResource.courseId ? (
                  <Link
                    href={`/courses/${previewResource.courseId}`}
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-bold bg-neutral-900 text-white hover:bg-blue-600 transition shadow-xs"
                  >
                    <BookOpen className="size-3.5" />
                    <span>Buka Halaman Modul Mata Kuliah</span>
                    <ChevronRight className="size-3" />
                  </Link>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <SecondaryButton
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewResource(null)}
                >
                  Tutup
                </SecondaryButton>
                {previewResource.attachmentId && (
                  <PrimaryButton
                    variant="brand"
                    size="sm"
                    disabled={isDownloading}
                    icon={<Download className="size-3.5" />}
                    onClick={() => {
                      const res = previewResource;
                      setPreviewResource(null);
                      handleRealDownload(res);
                    }}
                  >
                    {isDownloading ? 'Menyiapkan...' : 'Unduh Berkas'}
                  </PrimaryButton>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          DOWNLOAD MODAL / NOTICE
         ========================================================================= */}
      {downloadModalResource && (
        <Modal
          isOpen={!!downloadModalResource}
          onClose={() => {
            setDownloadModalResource(null);
            setDownloadError(null);
          }}
          title="Unduh Berkas Akademik"
          subtitle={`Mata Kuliah ${downloadModalResource.courseCode}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            {downloadError ? (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200 text-red-900 text-xs">
                <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Gagal Mengunduh Berkas</p>
                  <p className="text-red-800/80 mt-0.5">{downloadError}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs">
                <CheckCircle className="size-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Permintaan Berkas Berhasil Diproses</p>
                  <p className="text-emerald-800/80 mt-0.5">
                    {downloadModalResource.title} ({downloadModalResource.fileFormat} • {downloadModalResource.fileSize})
                  </p>
                </div>
              </div>
            )}

            {!isLiveDb && (
              <SimulationNotice
                actionName="Download Manager & Rate Limiting"
                backendRequirement="Endpoint Supabase Storage signed URL dengan verifikasi hak akses publik"
              />
            )}

            <div className="flex justify-end pt-2">
              <PrimaryButton
                variant="dark"
                size="sm"
                onClick={() => {
                  setDownloadModalResource(null);
                  setDownloadError(null);
                }}
              >
                Selesai & Tutup
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          UPLOAD FORM / SIMULATION MODAL
         ========================================================================= */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Kontribusi / Unggah Materi Kuliah"
          subtitle="Form Pengajuan Materi oleh Mahasiswa atau Dosen"
          maxWidth="lg"
        >
          {uploadSuccess ? (
            <div className="space-y-4 text-center py-4">
              <div className="grid place-items-center size-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                <CheckCircle className="size-6" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">
                Pengajuan Berhasil Dikirim!
              </h4>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                Berkas Anda telah masuk ke antrean kurasi akademik Departemen Manajemen Bisnis ITS.
              </p>
              {!isLiveDb && (
                <SimulationNotice
                  actionName="Upload Multipart Berkas & Validasi MIME"
                  backendRequirement="Bucket Storage Supabase dengan RLS dan antrean kurasi admin"
                />
              )}
              <div className="pt-2">
                <PrimaryButton
                  variant="dark"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Tutup Form
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setUploadSuccess(true);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Judul Materi / Berkas: *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Rangkuman Ujian Akhir Semester Manajemen Keuangan"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Mata Kuliah: *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {courseOptions.filter((c) => c !== 'Semua Mata Kuliah').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Tipe Berkas: *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {RESOURCE_TYPES_LIST.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nama Kontributor / Penulis: *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Nama Lengkap & Angkatan (Contoh: Budi Santoso - MB22)"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Pilih Dokumen (PDF/DOCX/XLSX/ZIP, Maks. 25MB): *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.zip,.ipynb"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white"
                />
              </div>

              {!isLiveDb && (
                <SimulationNotice
                  actionName="Simulasi Pengiriman Form Frontend"
                  backendRequirement="Data ini belum disimpan ke server database produksi. Memerlukan integrasi akun Supabase."
                />
              )}

              <div className="flex justify-end gap-2 pt-2">
                <SecondaryButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Batal
                </SecondaryButton>
                <PrimaryButton type="submit" variant="brand" size="sm">
                  Kirim Berkas
                </PrimaryButton>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
