'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SimulationNotice } from '@/components/ui/SimulationNotice';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { AchievementCard } from '@/components/cards/AchievementCard';
import { mockResources } from '@/data/resources';
import { mockAnnouncements } from '@/data/announcements';
import { mockAchievements } from '@/data/achievements';
import { Resource, Achievement, Announcement } from '@/types';
import { getPopularMaterials, recordMaterialVisit } from '@/lib/actions/materials';
import { getPublicAnnouncements } from '@/lib/actions/announcements';
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
  CheckCircle,
  ShieldCheck,
  Building,
  BellRing,
  Download,
  Flame,
  Radio,
} from 'lucide-react';

export default function HomePage() {
  // Modal states for simulation
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [downloadModalResource, setDownloadModalResource] = useState<Resource | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Real-time dynamic states (sorted by highest visit count from Materi & Soal)
  const [popularMaterials, setPopularMaterials] = useState<Resource[]>(() =>
    [...mockResources]
      .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
      .slice(0, 3)
      .map((r) => ({
        ...r,
        total_views: r.downloadCount * 4 + 100,
        timeframe_views: r.downloadCount * 4 + 100,
      }))
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => mockAnnouncements.slice(0, 4));
  const [isLiveMaterialsDb, setIsLiveMaterialsDb] = useState(false);
  const [isLiveAnnouncementsDb, setIsLiveAnnouncementsDb] = useState(false);

  // Load top most-visited materials from database
  useEffect(() => {
    let isMounted = true;
    async function loadPopularMaterials() {
      const res = await getPopularMaterials('all', 3);
      if (isMounted && res.data && res.data.length > 0) {
        setPopularMaterials(res.data);
        setIsLiveMaterialsDb(res.isLiveDb);
      }
    }
    loadPopularMaterials();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load announcements
  useEffect(() => {
    let isMounted = true;
    async function loadAnnouncements() {
      const res = await getPublicAnnouncements(4);
      if (isMounted && res.data && res.data.length > 0) {
        setAnnouncements(res.data);
        setIsLiveAnnouncementsDb(res.isLiveDb);
      }
    }
    loadAnnouncements();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardInteraction = async (resource: Resource, action: 'preview' | 'download') => {
    if (action === 'preview') {
      setPreviewResource(resource);
    } else {
      setDownloadModalResource(resource);
    }

    // Record visit in background
    recordMaterialVisit(resource.id);

    // Optimistically increment views on the active card
    setPopularMaterials((prev) =>
      prev.map((r) =>
        r.id === resource.id
          ? {
              ...r,
              timeframe_views: (r.timeframe_views || 0) + 1,
              total_views: (r.total_views || 0) + 1,
            }
          : r
      )
    );
  };

  const featuredAchievements = mockAchievements.slice(0, 2);

  return (
    <div className="flex flex-col gap-16 sm:gap-24 lg:gap-32 pb-16">
      {/* =========================================================================
          HERO SECTION — Inspired by reference site layout and typography
         ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-20 sm:pt-14 sm:pb-28 border-b border-neutral-100">
        {/* Signature background grid lines */}
        <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true" />

        <PageContainer>
          <div className="relative mx-auto flex min-h-[55vh] flex-col items-center justify-center text-center">
            {/* Floating Academic Badges */}
            <div className="animate-float absolute -top-4 right-4 sm:top-2 sm:right-16 hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-xs px-4 py-2 rounded-2xl border border-neutral-200/90 shadow-md">
              <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
                <ShieldCheck className="size-5" />
              </div>
              <div className="text-left text-xs">
                <p className="font-mono font-bold text-neutral-800">FIBAA Accredited</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Valid 2025–2030</p>
              </div>
            </div>

            <div className="animate-float-slow absolute bottom-12 left-4 sm:bottom-20 sm:left-12 hidden md:flex items-center gap-2.5 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-neutral-200/90 shadow-md">
              <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
                <Trophy className="size-5" />
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-neutral-800">Rektor Awards 2025</p>
                <p className="text-[10px] text-neutral-500">Juara 1 Internationalisation</p>
              </div>
            </div>

            {/* Main Display Title */}
            <div className="relative max-w-5xl">
              <span className="inline-block rounded-full bg-amber-300 text-neutral-950 font-bold px-4 py-1.5 text-xs uppercase tracking-wider mb-6 shadow-2xs">
                Portal Resmi Akademik & Kemahasiswaan
              </span>

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

            {/* Homepage Deep-Link Shortcuts (Inspired by Reference Pill Links) */}
            <div className="mt-10 flex flex-col items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Jelajahi Direktori Utama
              </span>
              <ul className="flex flex-wrap justify-center gap-2.5 sm:gap-3 max-w-4xl">
                <li>
                  <Link
                    href="/materi-soal"
                    className="group inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-neutral-900 whitespace-nowrap transition hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 shadow-2xs"
                  >
                    <BookOpen className="size-4" />
                    <span>Materi & Kurikulum</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-mono text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                      2 Program Studi
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dosen"
                    className="group inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-neutral-900 whitespace-nowrap transition hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 shadow-2xs"
                  >
                    <GraduationCap className="size-4" />
                    <span>Daftar Dosen</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-mono text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                      2 Lab & Staf
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wall-of-fame"
                    className="group inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-neutral-900 whitespace-nowrap transition hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 shadow-2xs"
                  >
                    <Trophy className="size-4 text-amber-500" />
                    <span>Wall of Fame</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-mono text-amber-800 group-hover:bg-amber-400 group-hover:text-black transition">
                      Prestasi Terpilih
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="group inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-neutral-900 whitespace-nowrap transition hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 shadow-2xs"
                  >
                    <Users className="size-4" />
                    <span>Who Are We?</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          INTRODUCTION SECTION — "Hello! We are Manajemen Bisnis ITS!"
         ========================================================================= */}
      <section className="relative">
        <PageContainer>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* Visual Card / Illustration */}
            <div className="md:col-span-6">
              <div className="relative aspect-[704/460] w-full rounded-[36px] bg-gradient-to-tr from-blue-900 via-blue-800 to-indigo-950 p-8 sm:p-10 text-white overflow-hidden shadow-2xl flex flex-col justify-between">
                <div className="grid-lines absolute inset-0 opacity-20" aria-hidden="true" />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-block bg-white/20 backdrop-blur-sm px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                    FDKBD (CREABIZ) • ITS Surabaya
                  </span>
                  <span className="font-mono text-xs text-blue-200">SEJAK 2011</span>
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Sparkles className="size-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Akreditasi Internasional FIBAA & Akreditasi Unggul
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                    S1 Manajemen Bisnis & S1 Bisnis Digital
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100 font-light leading-relaxed">
                    Departemen Manajemen Bisnis, Institut Teknologi Sepuluh Nopember (ITS) memadukan prinsip manajemen, teknologi, inovasi, kewirausahaan, riset, dan kolaborasi industri.
                  </p>
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-3 pt-4 border-t border-white/15 text-center">
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-amber-300 font-mono">Juara 1</p>
                    <p className="text-[10px] text-blue-200 uppercase">Internationalisation</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-white font-mono">2</p>
                    <p className="text-[10px] text-blue-200 uppercase">Laboratorium Riset</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-white font-mono">Unggul</p>
                    <p className="text-[10px] text-blue-200 uppercase">Akreditasi S1 MB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text description */}
            <div className="md:col-span-6 space-y-6">
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.05]">
                <span className="text-script font-normal block text-blue-600">
                  Hello! We are
                </span>
                <b>Manajemen Bisnis ITS!</b>
              </h2>

              <p className="text-base sm:text-xl font-light text-neutral-700 leading-relaxed">
                Kami adalah Departemen Manajemen Bisnis, Institut Teknologi Sepuluh Nopember (ITS). Kami menyelenggarakan dua program sarjana unggulan: S1 Manajemen Bisnis (Akreditasi Unggul & FIBAA 2025–2030) dan S1 Bisnis Digital (Akreditasi Baik 2024–2029).
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-neutral-700">
                    <b>S1 Manajemen Bisnis (S.M.):</b> Menyelenggarakan 144 SKS dalam empat konsentrasi utama: Manajemen Keuangan, Operasi, Pemasaran, dan Sumber Daya Manusia.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-neutral-700">
                    <b>S1 Bisnis Digital (S.Bns.):</b> Mengombinasikan manajemen bisnis dengan teknologi digital (Digital Marketing, Business Programming, Database, AI & IoT, E-Commerce).
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/about">
                  <PrimaryButton variant="dark" size="md" icon={<ArrowRight className="size-4" />}>
                    Kenali Visi, Misi & Lab Kami
                  </PrimaryButton>
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          THE PHILOSOPHY BEHIND SECTION
         ========================================================================= */}
      <section className="relative bg-neutral-50/70 py-20 border-y border-neutral-200/70">
        <PageContainer>
          <div className="text-center max-w-4xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-6xl font-bold tracking-tight text-neutral-900 leading-none">
              The <span className="text-script text-blue-600 px-2 font-normal">philosophy</span> behind
            </h2>
            <p className="mt-4 text-base sm:text-xl font-light text-neutral-600">
              Empat bidang konsentrasi manajemen utama yang membentuk kompetensi sarjana bisnis unggul:
            </p>
          </div>

          {/* 4 Pillars Grid (Inspired by the R-I-S-E keycaps on reference site) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              {
                letter: 'F',
                word: 'Finance',
                sub: 'Manajemen Keuangan',
                desc: 'Pengelolaan keputusan finansial, investasi, dan strategi nilai bisnis.',
              },
              {
                letter: 'O',
                word: 'Operations',
                sub: 'Manajemen Operasi',
                desc: 'Efisiensi rantai pasok, logistik, proses produksi, dan keunggulan operasional.',
              },
              {
                letter: 'M',
                word: 'Marketing',
                sub: 'Manajemen Pemasaran',
                desc: 'Analisis pasar, strategi pemasaran digital, kepuasan pelanggan, dan merek.',
              },
              {
                letter: 'H',
                word: 'Human Capital',
                sub: 'Sumber Daya Manusia',
                desc: 'Pengembangan talenta, kepemimpinan organisasi, dan budaya kerja adaptif.',
              },
            ].map((pilar, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-3xl border border-neutral-200/90 hover:border-blue-500 hover:shadow-xl transition-all duration-200"
              >
                <div className="grid place-items-center size-16 sm:size-20 rounded-2xl bg-blue-50 text-blue-600 font-black text-3xl sm:text-4xl mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs ring-4 ring-blue-50">
                  {pilar.letter}
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 mb-1">
                  {pilar.word}
                </h3>
                <p className="text-xs font-semibold text-blue-600 mb-2">
                  {pilar.sub}
                </p>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {pilar.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center max-w-3xl mx-auto text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
            <p>
              <b className="font-bold text-neutral-900">Finance</b> yang terukur menjamin ketahanan finansial, <b className="font-bold text-neutral-900">Operations</b> menghasilkan eksekusi bisnis yang andal, <b className="font-bold text-neutral-900">Marketing</b> memperluas jangkauan pasar, dan <b className="font-bold text-neutral-900">Human Capital</b> menumbuhkan kepemimpinan bisnis berdaya saing global.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          FEATURED LEARNING MATERIALS — REAL-TIME POPULARITY BY TIMEFRAME
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
                  {isLiveMaterialsDb ? 'Live Real-Time' : 'Simulasi Populer'}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 px-4 py-3 rounded-2xl bg-neutral-100/90 border border-neutral-200">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularMaterials.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onPreview={(res) => handleCardInteraction(res, 'preview')}
                onDownload={(res) => handleCardInteraction(res, 'download')}
              />
            ))}
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          ANNOUNCEMENTS & RECENT ACTIVITIES — REAL-TIME DATABASE DRIVEN
         ========================================================================= */}
      <section className="bg-neutral-50/60 py-16 sm:py-24 border-y border-neutral-200/70">
        <PageContainer>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2.5">
                <div className="grid place-items-center size-9 rounded-xl bg-blue-600 text-white shadow-xs">
                  <BellRing className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                      Pengumuman & Agenda Akademik
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <Radio className="size-3 text-blue-500 animate-pulse" />
                      Live Feed
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                    Informasi penting terkini seputar perkuliahan, kompetisi, dan kegiatan jurusan.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/announcements"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-blue-600 transition"
                title="Kelola pengumuman di panel admin"
              >
                <span>Kelola di Admin</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-neutral-200/80 hover:border-blue-400 hover:shadow-md transition-all"
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
          WALL OF FAME TEASER SECTION
         ========================================================================= */}
      <section>
        <PageContainer>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1 block">
                Kebanggaan Komunitas
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900">
                Wall of <span className="text-script text-blue-600 font-normal">Fame</span>
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 font-light mt-2 max-w-xl">
                Apresiasi untuk mahasiswa yang mengharumkan nama program studi di ajang kompetisi, publikasi, dan startup.
              </p>
            </div>

            <Link href="/wall-of-fame">
              <SecondaryButton variant="outline" size="sm" icon={<ArrowRight className="size-3.5" />}>
                Lihat Semua Prestasi
              </SecondaryButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredAchievements.map((ach) => (
              <AchievementCard
                key={ach.id}
                achievement={ach}
                onSelect={(selected) => setSelectedAchievement(selected)}
              />
            ))}
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          SUPPORTED BY & ACCREDITATION (Inspired by Reference)
         ========================================================================= */}
      <section className="pt-8">
        <PageContainer>
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900">
              Didukung <span className="text-script text-blue-600 font-normal">oleh</span> & Akreditasi
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2">
              Bekerja sama dengan institusi akreditasi internasional dan ekosistem pendidikan bisnis terdepan.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              { name: 'FIBAA Accreditation', sub: 'Periode 2025–2030 (Internasional)' },
              { name: 'BAN-PT / LAMEMBA', sub: 'Akreditasi Unggul & Baik' },
              { name: 'FDKBD (CREABIZ)', sub: 'Fakultas Desain Kreatif dan Bisnis Digital' },
              { name: 'Institut Teknologi Sepuluh Nopember', sub: 'Kampus Sukolilo, Surabaya' },
              { name: 'Kemendikbudristek RI', sub: 'Kementerian Pendidikan Tinggi Indonesia' },
            ].map((partner, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-blue-400 transition"
              >
                <div className="grid place-items-center size-8 rounded-xl bg-neutral-100 text-neutral-700 font-bold text-xs">
                  {partner.name[0]}
                </div>
                <div className="text-left text-xs">
                  <p className="font-bold text-neutral-900">{partner.name}</p>
                  <p className="text-[10px] text-neutral-500">{partner.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          INTERACTION MODALS (PREVIEW & DOWNLOAD SIMULATION)
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
                <span className="text-neutral-400 block text-[10px]">Tahun Ajaran</span>
                <span className="font-bold text-neutral-800">{previewResource.academicYear}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-400 block text-[10px]">Semester</span>
                <span className="font-bold text-neutral-800">Semester {previewResource.semester}</span>
              </div>
            </div>

            {/* Document preview snippet */}
            <div className="border border-neutral-200 rounded-2xl p-5 bg-neutral-900 text-neutral-100 font-mono text-xs space-y-2">
              <p className="text-neutral-400">// Ringkasan Bab Pokok Bahasan:</p>
              <p className="text-emerald-400">1. Konsep & Landasan Teori: Manajemen Bisnis dan Analisis Kuantitatif</p>
              <p className="text-emerald-400">2. Implementasi Strategis: Keputusan berbasis data dan efisiensi operasional</p>
              <p className="text-emerald-400">3. Analisis Studi Kasus & Evaluasi Pembelajaran</p>
            </div>

            <SimulationNotice
              actionName="Buka Pratinjau Dokumen Online"
              backendRequirement="S3/Cloudflare R2 Object Storage viewer & PDF.js stream engine"
            />

            <div className="flex justify-end gap-2 pt-2">
              <SecondaryButton
                variant="outline"
                size="sm"
                onClick={() => setPreviewResource(null)}
              >
                Tutup
              </SecondaryButton>
              <PrimaryButton
                variant="brand"
                size="sm"
                icon={<Download className="size-3.5" />}
                onClick={() => {
                  const res = previewResource;
                  setPreviewResource(null);
                  setDownloadModalResource(res);
                }}
              >
                Unduh Berkas
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}

      {downloadModalResource && (
        <Modal
          isOpen={!!downloadModalResource}
          onClose={() => setDownloadModalResource(null)}
          title="Unduh Berkas Akademik"
          subtitle={`Mata Kuliah ${downloadModalResource.courseCode}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs">
              <CheckCircle className="size-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Permintaan Berkas Berhasil Divalidasi</p>
                <p className="text-emerald-800/80 mt-0.5">
                  {downloadModalResource.title} ({downloadModalResource.fileFormat} • {downloadModalResource.fileSize})
                </p>
              </div>
            </div>

            <SimulationNotice
              actionName="Download Manager & Rate Limiting"
              backendRequirement="Presigned URLs dari AWS S3 / Cloudflare R2 dengan validasi kuota download autentikasi SSO ITS"
            />

            <div className="flex justify-end pt-2">
              <PrimaryButton
                variant="dark"
                size="sm"
                onClick={() => setDownloadModalResource(null)}
              >
                Selesai & Tutup
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}

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
              <p className="font-bold text-neutral-900 mb-1">Anggota Tim / Penerima:</p>
              <p className="text-neutral-600 font-mono text-xs bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                {selectedAchievement.members.join(' • ')}
              </p>
            </div>

            {selectedAchievement.advisor && (
              <div>
                <p className="font-bold text-neutral-900 mb-1">Dosen Pembimbing / Advisor:</p>
                <p className="text-neutral-600">{selectedAchievement.advisor}</p>
              </div>
            )}

            <div>
              <p className="font-bold text-neutral-900 mb-1">Deskripsi & Capaian Proyek:</p>
              <p className="text-neutral-600 leading-relaxed">{selectedAchievement.description}</p>
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
    </div>
  );
}
