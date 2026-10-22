'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeading } from '@/components/ui/PageHeading';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Modal } from '@/components/ui/Modal';
import { aboutData, AcademicLab } from '@/data/about';
import {
  Compass,
  Target,
  Sparkles,
  Calendar,
  Layers,
  Users,
  Cpu,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';

export default function AboutPage() {
  const [selectedLab, setSelectedLab] = useState<AcademicLab | null>(null);

  return (
    <div className="flex flex-col gap-16 sm:gap-24 lg:gap-32 pb-20">
      {/* =========================================================================
          PAGE HEADER
         ========================================================================= */}
      <section className="relative overflow-hidden border-b border-neutral-100 bg-neutral-50/40">
        <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true" />
        <PageContainer>
          <PageHeading
            badge="Profil Departemen & Komunitas"
            badgeVariant="yellow"
            titlePrefix="Who Are"
            accentWord="We?"
            description="Mengenal lebih dekat identitas, sejarah, visi-misi, serta ekosistem akademik dan riset Departemen Manajemen Bisnis ITS."
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-2xs">
                <ShieldCheck className="size-3.5 text-blue-600" />
                Terakreditasi FIBAA & Unggul
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-2xs">
                <Calendar className="size-3.5 text-amber-500" />
                Didirikan Tahun {aboutData.establishmentYear}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-2xs">
                <Cpu className="size-3.5 text-emerald-600" />
                2 Laboratorium Riset (ESME & BAS)
              </span>
            </div>
          </PageHeading>
        </PageContainer>
      </section>

      {/* =========================================================================
          OVERVIEW & ACADEMIC IDENTITY
         ========================================================================= */}
      <section>
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Identitas Departemen & Program Studi
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
                Menghadirkan Keunggulan Bisnis Berbasis Teknologi dan Inovasi
              </h2>
              {aboutData.overview.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-base sm:text-lg text-neutral-600 font-light leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}

              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/materi-soal">
                  <PrimaryButton variant="brand" size="md">
                    Jelajahi Kurikulum & Materi
                  </PrimaryButton>
                </Link>
                <Link href="/dosen">
                  <SecondaryButton variant="outline" size="md">
                    Lihat Dewan Pengajar
                  </SecondaryButton>
                </Link>
              </div>
            </div>

            {/* Quick Facts Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-tr from-blue-900 via-blue-800 to-indigo-900 rounded-[32px] p-8 text-white shadow-xl space-y-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                    Fakta Singkat Departemen
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">
                    {aboutData.departmentName}
                  </h3>
                </div>

                <div className="space-y-4 pt-2 border-t border-white/10 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-white/10 text-amber-300 shrink-0">
                      <GraduationCap className="size-4" />
                    </div>
                    <div>
                      <p className="font-bold">S1 Manajemen Bisnis :</p>
                      <p className="text-blue-100">144 SKS  |   Akreditasi Unggul | FIBAA (2025–2030)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-white/10 text-amber-300 shrink-0">
                      <Layers className="size-4" />
                    </div>
                    <div>
                      <p className="font-bold">S1 Bisnis Digital :</p>
                      <p className="text-blue-100">144 SKS | Akreditasi Baik (2024–2029)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-white/10 text-amber-300 shrink-0">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div>
                      <p className="text-blue-100">Kampus ITS Sukolilo, Surabaya</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          VISION & MISSION (WITH EXPLICIT PROVISIONAL PLACEHOLDER NOTICE)
         ========================================================================= */}
      <section className="bg-neutral-50/70 py-16 sm:py-24 border-y border-neutral-200/70">
        <PageContainer>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              eyebrow="Landasan Strategis"
              titlePrefix="Visi &"
              accentWord="Misi"
              titleSuffix="Akademik"
              description="Arah tujuan jangka panjang dan komitmen strategis dalam tridharma perguruan tinggi."
            />

            {/* Clear provisional placeholder notice */}
            <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Catatan Konten Contoh Resmi:</p>
                <p className="mt-0.5 leading-relaxed text-amber-800">
                  {aboutData.vision.isProvisionalNotice}
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/90 shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid place-items-center size-10 rounded-xl bg-blue-50 text-blue-600">
                  <Compass className="size-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Pernyataan Visi
                  </span>
                  <h3 className="text-xl font-bold text-neutral-900">{aboutData.vision.title}</h3>
                </div>
              </div>
              <blockquote className="text-base sm:text-xl font-light text-neutral-800 italic leading-relaxed pl-4 border-l-4 border-blue-600">
                “{aboutData.vision.statement}”
              </blockquote>
            </div>

            {/* Mission Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aboutData.mission.map((m) => (
                <div
                  key={m.number}
                  className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-2xs hover:border-blue-400 transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono font-black text-lg text-blue-600 bg-blue-50 size-8 rounded-xl grid place-items-center">
                      {m.number}
                    </span>
                    <h4 className="font-bold text-neutral-900 text-base">{m.title}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                    {m.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          RESEARCH LABORATORIES
         ========================================================================= */}
      <section>
        <PageContainer>
          <SectionHeading
            eyebrow="Kelompok Keahlian & Riset"
            titlePrefix="Laboratorium"
            accentWord="Riset"
            titleSuffix="Unggulan"
            description="Pusat kegiatan praktikum, riset skripsi tingkat akhir, dan publikasi ilmiah sivitas akademika."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aboutData.laboratories.map((lab) => (
              <div
                key={lab.id}
                className="group bg-white rounded-3xl p-7 border border-neutral-200/90 hover:border-blue-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="brand" size="sm">
                      {lab.name.split('(')[1]?.replace(')', '') || 'Lab Riset'}
                    </Badge>
                    <span className="text-[11px] font-medium text-neutral-400">
                      Kampus ITS Sukolilo
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                    {lab.name}
                  </h3>
                  <p className="text-xs font-semibold text-neutral-500 mt-1">
                    Kepala Lab: {lab.head}
                  </p>

                  <p className="text-xs sm:text-sm text-neutral-600 mt-3 leading-relaxed">
                    {lab.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                      Fokus Bidang Kajian:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {lab.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] font-medium bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedLab(lab)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    <span>Detail Riset Lab →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          ORGANIZATIONAL STRUCTURE & LEADERSHIP
         ========================================================================= */}
      <section className="bg-neutral-50/60 py-16 sm:py-24 border-y border-neutral-200/70">
        <PageContainer>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              eyebrow="Kepemimpinan Departemen"
              titlePrefix="Struktur"
              accentWord="Kepemimpinan"
              titleSuffix="Departemen"
              description={`Struktur pimpinan ${aboutData.organizationStructure.associationName} periode ${aboutData.organizationStructure.period}.`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {aboutData.organizationStructure.roles.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs hover:border-blue-400 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                    <span className="text-[10px] text-neutral-400">{item.division}</span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                    {item.role}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1">{item.name}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/materi-soal">
                <SecondaryButton
                  variant="outline"
                  size="sm"
                  icon={<ExternalLink className="size-3.5" />}
                >
                  Lihat Modul & Bahan Belajar Departemen
                </SecondaryButton>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          HISTORICAL TIMELINE
         ========================================================================= */}
      <section>
        <PageContainer size="narrow">
          <SectionHeading
            eyebrow="Jejak Sejarah"
            titlePrefix="Perjalanan"
            accentWord="Departemen"
            titleSuffix="2011-2025"
            description="Tonggak bersejarah pendirian dan perkembangan Departemen Manajemen Bisnis ITS."
          />

          <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 space-y-10 my-8">
            {aboutData.timeline.map((event, idx) => (
              <div key={idx} className="relative group">
                {/* Node indicator */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 grid place-items-center size-5 rounded-full bg-white border-4 border-blue-600 group-hover:scale-125 transition-transform" />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-sm text-blue-600">
                      {event.year}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {event.tag}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">{event.title}</h3>
                  <p className="text-sm text-neutral-600 font-light leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          MODAL DETAIL LAB
         ========================================================================= */}
      {selectedLab && (
        <Modal
          isOpen={!!selectedLab}
          onClose={() => setSelectedLab(null)}
          title={selectedLab.name}
          subtitle={`Kepala Lab: ${selectedLab.head}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
            <div>
              <p className="font-bold text-neutral-900 mb-1">Deskripsi & Peran Laboratorium:</p>
              <p className="text-neutral-600 leading-relaxed">{selectedLab.description}</p>
            </div>

            <div>
              <p className="font-bold text-neutral-900 mb-1">Bidang Kajian Utama:</p>
              <p className="text-neutral-600 leading-relaxed bg-blue-50/60 p-3 rounded-2xl border border-blue-200 text-xs">
                {selectedLab.focus}
              </p>
            </div>

            <div>
              <p className="font-bold text-neutral-900 mb-1.5">Fokus Bidang Kajian & Analitik:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedLab.technologies.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-semibold bg-neutral-100 text-neutral-800 px-3 py-1 rounded-full border border-neutral-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <SecondaryButton
                variant="outline"
                size="sm"
                onClick={() => setSelectedLab(null)}
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
