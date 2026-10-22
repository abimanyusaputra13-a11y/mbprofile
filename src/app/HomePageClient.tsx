'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { Resource, Announcement } from '@/types';
import { CourseWithDetails } from '@/types/course';
import { mapCoursesToResources } from '@/lib/utils/resourceMapper';
import { getAttachmentDownloadUrl } from '@/lib/actions/courses';
import { getMaterialDownloadUrl, recordMaterialVisit } from '@/lib/actions/materials';
import {
  BookOpen,
  GraduationCap,
  Trophy,
  FileText,
  Users,
  ArrowRight,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  Code2,
  ShieldCheck,
  BellRing,
  Download,
  Flame,
  Radio,
  Percent,
  ListOrdered,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface HomePageClientProps {
  initialCourses: CourseWithDetails[];
  initialMaterials?: Resource[];
  isLiveCoursesDb: boolean;
  initialAnnouncements: Announcement[];
  isLiveAnnouncementsDb: boolean;
}

export function HomePageClient({
  initialCourses,
  initialMaterials = [],
  isLiveCoursesDb,
  initialAnnouncements,
  isLiveAnnouncementsDb,
}: HomePageClientProps) {
  // Modal states
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [downloadNoticeResource, setDownloadNoticeResource] = useState<{
    resource: Resource;
    error?: string;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Directly map courses and verified learning materials
  const allResources: Resource[] = useMemo(() => {
    if (isLiveCoursesDb) {
      const userMaterials = initialMaterials || [];
      const courseResources = mapCoursesToResources(initialCourses);
      return [...userMaterials, ...courseResources];
    }
    return [];
  }, [isLiveCoursesDb, initialCourses, initialMaterials]);

  // Sort automatically by most visited / downloaded from Materi & Soal data
  const popularMaterials: Resource[] = useMemo(() => {
    const list = [...allResources];
    list.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    return list.slice(0, 3);
  }, [allResources]);

  // Real attachment download handler
  const handleRealDownload = async (resource: Resource) => {
    if (resource.sampleUrl) {
      setIsDownloading(true);
      try {
        const res = await getMaterialDownloadUrl(resource.sampleUrl);
        if (res.error || !res.url) {
          setDownloadNoticeResource({
            resource,
            error: res.error || 'Gagal membuat tautan unduhan berkas.',
          });
        } else {
          recordMaterialVisit(resource.id);
          const a = document.createElement('a');
          a.href = res.url;
          a.download = `${resource.title}.${resource.fileFormat?.toLowerCase() || 'pdf'}`;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kendala saat mengunduh berkas.';
        setDownloadNoticeResource({ resource, error: msg });
      } finally {
        setIsDownloading(false);
      }
      return;
    }

    if (!resource.attachmentId) {
      setDownloadNoticeResource({
        resource,
        error:
          'Berkas unduhan langsung belum dilampirkan untuk mata kuliah ini. Silakan buka silabus dan modul mingguan untuk mengakses materi lengkap.',
      });
      return;
    }

    setIsDownloading(true);
    try {
      const res = await getAttachmentDownloadUrl(resource.attachmentId);
      if (res.error || !res.url) {
        setDownloadNoticeResource({
          resource,
          error: res.error || 'Gagal membuat tautan unduhan berkas.',
        });
      } else {
        const a = document.createElement('a');
        a.href = res.url;
        a.download = resource.title;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat mengunduh berkas.';
      setDownloadNoticeResource({ resource, error: msg });
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20 pb-16">
      {/* =========================================================================
          HERO SECTION
         ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-neutral-100">
        <PageContainer>
          <div className="relative mx-auto flex min-h-[55vh] flex-col items-center justify-center text-center">
            {/* Floating Academic Badges — Symmetrically positioned at top left and top right */}
            <div className="animate-float-slow absolute -top-4 left-2 sm:top-2 sm:left-6 lg:left-12 xl:left-16 hidden md:flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] z-10">
              <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-black/20">
                <Trophy className="size-5" />
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-neutral-800">Rektor Awards 2025</p>
                <p className="text-[10px] text-neutral-500">Juara 1 Internationalisation</p>
              </div>
            </div>

            <div className="animate-float absolute -top-4 right-2 sm:top-2 sm:right-6 lg:right-12 xl:right-16 hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] z-10">
              <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600 border border-black/20">
                <ShieldCheck className="size-5" />
              </div>
              <div className="text-left text-xs">
                <p className="font-mono font-bold text-neutral-800">FIBAA Accredited</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Valid 2025–2030</p>
              </div>
            </div>

            {/* Main Display Title */}
            <div className="relative max-w-5xl pt-2 sm:pt-4">
              <h1 className="text-center font-bold tracking-tight text-neutral-900 leading-[0.95]">
                <span className="block text-[clamp(2.5rem,7vw,6.5rem)] font-bold">
                  Welcome to
                </span>
                <span className="text-script block text-[clamp(2.75rem,8vw,7.5rem)] text-blue-600 font-normal mt-1">
                  Manajemen Bisnis
                </span>
              </h1>
            </div>

            {/* Subtitle / Philosophy Motto */}
            <p className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-base sm:text-2xl italic text-neutral-700 font-light max-w-4xl">
              <span className="font-semibold text-neutral-900 not-italic">Management</span>
              <span aria-hidden="true" className="text-xs text-blue-500 not-italic">◆</span>
              <span className="font-semibold text-neutral-900 not-italic">Technology</span>
              <span aria-hidden="true" className="text-xs text-blue-500 not-italic">◆</span>
              <span className="font-semibold text-neutral-900 not-italic">Innovation</span>
              <span aria-hidden="true" className="text-xs text-blue-500 not-italic">◆</span>
              <span className="font-semibold text-neutral-900 not-italic">Entrepreneurship</span>
            </p>

            <p className="mt-4 text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
              Departemen Manajemen Bisnis, Institut Teknologi Sepuluh Nopember (ITS). Menyelenggarakan pendidikan bisnis dan manajemen unggul yang memadukan prinsip manajemen, teknologi, inovasi, kewirausahaan, riset, dan kolaborasi industri.
            </p>

            {/* Direct Quick Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/materi-soal">
                <PrimaryButton variant="brand" size="md" icon={<BookOpen className="size-4" />}>
                  Akses Materi & Soal
                </PrimaryButton>
              </Link>
              <Link href="/courses">
                <SecondaryButton variant="outline" size="md" icon={<ArrowRight className="size-4" />}>
                  Katalog Mata Kuliah
                </SecondaryButton>
              </Link>
              <Link href="/dosen">
                <SecondaryButton variant="ghost" size="md">
                  Direktori Dosen
                </SecondaryButton>
              </Link>
            </div>

            {/* Fast Stats Bar */}
            <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 w-full max-w-4xl text-left">
              {[
                { label: 'Program Studi', value: 'S1 & S2', desc: 'Bisnis & Manajemen', icon: GraduationCap },
                { label: 'Mahasiswa Aktif', value: '800+', desc: 'Sarjana & Pascasarjana', icon: Users },
                { label: 'Koleksi Belajar', value: `${allResources.length} Koleksi`, desc: 'Silabus & Modul Aktif', icon: FileText },
                { label: 'Dosen & Pakar', value: '25+', desc: 'Praktisi & Akademisi', icon: Sparkles },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    <Icon className="size-5 text-blue-600 mb-2" />
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                      {stat.value}
                    </p>
                    <p className="text-xs font-semibold text-neutral-700 mt-0.5">{stat.label}</p>
                    <p className="text-[11px] text-neutral-400">{stat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          FEATURED LEARNING MATERIALS — IMPORTED DIRECTLY FROM MATERI DAN SOAL
         ========================================================================= */}
      <section>
        <PageContainer>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block">
                  Sumber Belajar Terbuka
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isLiveCoursesDb ? 'Database Aktif' : 'Repositori Terbuka'}
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900">
                Materi & <span className="text-script text-blue-600 font-normal">Bank Soal</span> Populer
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 font-light mt-2 max-w-xl">
                Akses materi dan bank soal yang paling banyak dikunjungi mahasiswa berdasarkan data kunjungan pada halaman Materi dan Soal.
              </p>
            </div>

            <Link href="/materi-soal">
              <SecondaryButton variant="outline" size="sm" icon={<ArrowRight className="size-3.5" />}>
                Lihat Semua Modul & Bank Soal
              </SecondaryButton>
            </Link>
          </div>

          {/* Popular Ranking Indicator Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 px-5 py-3.5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center size-6 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold shadow-2xs">
                🏆
              </span>
              <span className="text-xs font-bold text-neutral-900">
                Materi & Bank Soal Terpopuler
              </span>
              <span className="hidden sm:inline text-neutral-400">•</span>
              <span className="hidden sm:inline text-xs text-neutral-600">
                Diurutkan otomatis dari materi dan soal yang paling banyak dikunjungi
              </span>
            </div>

            <div className="text-[11px] text-neutral-500 px-1 flex items-center gap-1.5">
              <Flame className="size-3.5 text-amber-500 shrink-0" />
              <span>Diurutkan otomatis dari kunjungan terbanyak</span>
            </div>
          </div>

          {/* Cards Grid */}
          {popularMaterials.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-neutral-300 bg-neutral-50">
              <p className="text-sm font-semibold text-neutral-700">Belum ada materi atau bank soal yang dipublikasikan.</p>
              <p className="text-xs text-neutral-500 mt-1">Materi yang dipublikasikan di halaman Materi dan Soal akan otomatis muncul di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularMaterials.map((resource) => (
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

      {/* =========================================================================
          ANNOUNCEMENTS & ACADEMIC AGENDA
         ========================================================================= */}
      <section>
        <PageContainer>
          <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block">
                    Pusat Informasi Terkini
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                    <Radio className="size-2.5 animate-pulse text-blue-600" />
                    {isLiveAnnouncementsDb ? 'Database Aktif' : 'Simulasi'}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
                  Pengumuman & <span className="text-script text-blue-600 font-normal">Agenda</span>
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Pemberitahuan akademik resmi, tenggat penting perkuliahan, dan agenda kemahasiswaan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-blue-600 transition px-3 py-1.5 rounded-xl border border-neutral-200 bg-white"
                >
                  <ShieldCheck className="size-3.5" />
                  <span>Portal Admin</span>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {initialAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.isPinned && (
                        <span className="text-[10px] font-bold uppercase bg-amber-400 text-neutral-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                          Disematkan
                        </span>
                      )}
                      <Badge variant="brand" size="sm">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-neutral-400 font-mono">
                        {item.date}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {item.linkUrl && (
                    <Link
                      href={item.linkUrl}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition shrink-0 whitespace-nowrap self-start sm:self-center"
                    >
                      <span>{item.linkText || 'Selengkapnya'}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>



      {/* =========================================================================
          PREVIEW MODAL (REAL COURSE / SYLLABUS / WEEKLY MODULES PREVIEW)
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
                <span className="text-neutral-400 block text-[10px]">Format &amp; Ukuran</span>
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

            {/* Real course details: Evaluation components & Weekly topics */}
            {previewResource.courseDetails && (() => {
              const details = previewResource.courseDetails as CourseWithDetails;
              return (
                <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50 text-xs space-y-3 max-h-72 overflow-y-auto">
                  {details.assessments && details.assessments.length > 0 && (
                    <div>
                      <h5 className="font-bold text-neutral-800 mb-1 flex items-center gap-1.5">
                        <Percent className="size-3.5 text-blue-600" />
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
                          <ListOrdered className="size-3.5 text-blue-600" />
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
                              <span>Akses Modul</span>
                              <ChevronRight className="size-3" />
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-2">
              <SecondaryButton
                variant="outline"
                size="sm"
                onClick={() => setPreviewResource(null)}
              >
                Tutup
              </SecondaryButton>
              {(previewResource.attachmentId || previewResource.sampleUrl) && (
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
              {previewResource.courseId && (
                <Link href={`/courses/${previewResource.courseId}`}>
                  <PrimaryButton
                    variant="brand"
                    size="sm"
                    icon={<BookOpen className="size-3.5" />}
                  >
                    Buka Silabus Lengkap
                  </PrimaryButton>
                </Link>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          DOWNLOAD NOTICE MODAL (FOR MISSING ATTACHMENT OR GUIDANCE)
         ========================================================================= */}
      {downloadNoticeResource && (
        <Modal
          isOpen={!!downloadNoticeResource}
          onClose={() => setDownloadNoticeResource(null)}
          title={`Unduh: ${downloadNoticeResource.resource.courseCode}`}
          subtitle={downloadNoticeResource.resource.title}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Informasi Berkas</p>
                <p className="mt-1 leading-relaxed">{downloadNoticeResource.error}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <SecondaryButton
                variant="outline"
                size="sm"
                onClick={() => setDownloadNoticeResource(null)}
              >
                Tutup
              </SecondaryButton>
              {downloadNoticeResource.resource.courseId && (
                <Link href={`/courses/${downloadNoticeResource.resource.courseId}`}>
                  <PrimaryButton
                    variant="brand"
                    size="sm"
                    icon={<ChevronRight className="size-3.5" />}
                    onClick={() => setDownloadNoticeResource(null)}
                  >
                    Buka Silabus
                  </PrimaryButton>
                </Link>
              )}
            </div>
          </div>
        </Modal>
      )}


    </div>
  );
}
