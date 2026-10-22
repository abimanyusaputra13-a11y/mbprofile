'use client';

import React, { useState } from 'react';
import { Achievement } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Users, GraduationCap, Sparkles, ArrowRight } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  onSelect?: (achievement: Achievement) => void;
}

const BADGE_VARIANT_MAP: Record<string, 'yellow' | 'purple' | 'green' | 'brand'> = {
  gold: 'yellow',
  purple: 'purple',
  green: 'green',
};

function getBadgeVariant(variant?: Achievement['badgeVariant']): 'yellow' | 'purple' | 'green' | 'brand' {
  if (variant && variant in BADGE_VARIANT_MAP) {
    return BADGE_VARIANT_MAP[variant];
  }
  return 'brand';
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onSelect }) => {
  const [hoveredSection, setHoveredSection] = useState<'left' | 'right' | null>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(achievement)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(achievement);
        }
      }}
      onMouseLeave={() => setHoveredSection(null)}
      data-hover={hoveredSection || 'default'}
      className="ach-card-wrapper group relative flex flex-col sm:flex-row bg-white rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-[9px_9px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      <style>{`
        @media (min-width: 640px) {
          .ach-card-wrapper {
            display: flex !important;
            flex-direction: row !important;
            min-height: 295px;
          }
          .ach-col-left {
            width: 35% !important;
            flex: 0 0 35% !important;
            max-width: 35% !important;
            min-width: 0 !important;
            transition: all 650ms cubic-bezier(0.25, 1, 0.5, 1) !important;
            will-change: width, flex-basis, max-width;
          }
          .ach-col-right {
            width: 65% !important;
            flex: 0 0 65% !important;
            max-width: 65% !important;
            min-width: 0 !important;
            transition: all 650ms cubic-bezier(0.25, 1, 0.5, 1) !important;
            will-change: width, flex-basis, max-width;
          }
          .ach-card-wrapper[data-hover="left"] .ach-col-left {
            width: 78% !important;
            flex: 0 0 78% !important;
            max-width: 78% !important;
          }
          .ach-card-wrapper[data-hover="left"] .ach-col-right {
            width: 22% !important;
            flex: 0 0 22% !important;
            max-width: 22% !important;
          }
          .ach-card-wrapper[data-hover="right"] .ach-col-left {
            width: 16% !important;
            flex: 0 0 16% !important;
            max-width: 16% !important;
          }
          .ach-card-wrapper[data-hover="right"] .ach-col-right {
            width: 84% !important;
            flex: 0 0 84% !important;
            max-width: 84% !important;
          }
          .ach-card-wrapper[data-hover="left"] .ach-text-body {
            transform: translateX(36px) !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
          .ach-card-wrapper[data-hover="left"] .ach-peek-badge {
            transform: translateX(0px) scale(1) !important;
            opacity: 1 !important;
          }
          .ach-card-wrapper[data-hover="right"] .ach-hide-when-narrow {
            transform: translateX(-18px) scale(0.9) !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        }

        .ach-text-body {
          min-width: 320px;
          transition: transform 550ms cubic-bezier(0.25, 1, 0.5, 1), opacity 400ms ease;
          will-change: transform, opacity;
        }
        .ach-peek-badge {
          transition: transform 500ms cubic-bezier(0.25, 1, 0.5, 1), opacity 350ms ease;
          will-change: transform, opacity;
          opacity: 0;
          transform: translateX(-14px) scale(0.85);
          pointer-events: none;
        }
        .ach-hide-when-narrow {
          transition: transform 550ms cubic-bezier(0.25, 1, 0.5, 1), opacity 400ms ease;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .ach-col-left, .ach-col-right, .ach-text-body, .ach-peek-badge, .ach-hide-when-narrow {
            transition: none !important;
          }
        }
      `}</style>

      {/* Sisi Kiri: Foto Dokumentasi Prestasi */}
      <div
        onMouseEnter={() => setHoveredSection('left')}
        className="ach-col-left w-full relative bg-neutral-900 overflow-hidden min-h-[220px] sm:min-h-full flex items-center justify-center shrink-0"
      >
        {achievement.photoUrl ? (
          <>
            <img
              src={achievement.photoUrl}
              alt={achievement.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out absolute inset-0"
            />
            {/* Subtle backdrop overlay when right section expands */}
            <div
              className={`absolute inset-0 bg-neutral-950/40 transition-opacity duration-500 pointer-events-none ${
                hoveredSection === 'right' ? 'sm:opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative">
            <div
              className={`rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner transition-all duration-500 ${
                hoveredSection === 'left' ? 'size-16 mb-3' : 'size-12 sm:size-14 mb-2'
              }`}
            >
              <Trophy
                className={`text-amber-400 drop-shadow transition-all duration-500 ${
                  hoveredSection === 'left' ? 'size-8' : 'size-6 sm:size-7'
                }`}
              />
            </div>
            <div className="ach-hide-when-narrow">
              <p className="text-xs font-bold text-neutral-200 tracking-wide whitespace-nowrap">
                Dokumentasi Prestasi
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5 whitespace-nowrap">
                Departemen MB ITS
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Sisi Kanan: Pencapaian, Penyelenggara, Rincian Mahasiswa & Deskripsi (Satu Kesatuan) */}
      <div
        onMouseEnter={() => setHoveredSection('right')}
        className="ach-col-right relative w-full overflow-hidden p-5 sm:p-6 flex flex-col justify-between shrink-0"
      >
        {/* Collapsed peek indicator when left section is hovered */}
        <div
          aria-hidden="true"
          className="ach-peek-badge absolute inset-0 flex flex-col items-center justify-center p-3"
        >
          <div className="size-9 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-300 shadow-xs text-neutral-700">
            <ArrowRight className="size-4" />
          </div>
          <span className="text-[10px] font-bold text-neutral-500 mt-1.5 tracking-wider uppercase">
            Info
          </span>
        </div>

        {/* Full Information Content */}
        <div className="ach-text-body w-full flex-1 flex flex-col justify-between">
          <div>
            {/* Tag Kategori & Tingkat */}
            <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold text-neutral-500">
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                {achievement.category}
              </span>
              <span>•</span>
              <span className="text-neutral-500">{achievement.level}</span>
            </div>

            {/* Pencapaian: Nama Ajang / Kompetisi */}
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors leading-snug">
              {achievement.title}
            </h3>

            {/* Penyelenggara di bawahnya, sedikit lebih kecil warna abu-abu */}
            <p className="text-xs text-neutral-500 font-medium mt-1">
              {achievement.eventOrganizer}
            </p>

            {/* Rincian Anggota Tim & Nama Mahasiswa (Rapi, tanpa kotak terpisah) */}
            <div className="mt-3.5 space-y-1">
              {achievement.teamName && (
                <p className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  <span>Tim: {achievement.teamName}</span>
                </p>
              )}
              <div className="flex items-start gap-1.5 text-xs text-neutral-700">
                <Users className="size-3.5 text-neutral-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-neutral-800">Mahasiswa: </span>
                  {achievement.members.map((member, idx) => (
                    <span key={idx} className="font-medium text-neutral-700">
                      {idx > 0 ? ', ' : ''}
                      {member}
                    </span>
                  ))}
                </div>
              </div>
              {achievement.advisor && (
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-0.5">
                  <GraduationCap className="size-3 text-neutral-400 shrink-0" />
                  <span>Dosen Pembina: {achievement.advisor}</span>
                </div>
              )}
            </div>

            {/* Deskripsi Capaian Prestasi di bawahnya */}
            <p className="text-xs text-neutral-600 mt-3 leading-relaxed font-light line-clamp-3">
              {achievement.description}
            </p>
          </div>

          {/* Footer Kartu */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-neutral-400">
              Klik untuk detail
            </span>
            <span className="font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              <span>Lihat Detail</span>
              <ArrowRight className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
