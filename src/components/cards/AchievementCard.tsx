'use client';

import React from 'react';
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
  return (
    <div
      onClick={() => onSelect?.(achievement)}
      className="group relative flex flex-col sm:flex-row bg-white rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-[9px_9px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Sisi Kiri: Foto Dokumentasi Prestasi */}
      <div className="w-full sm:w-[38%] lg:w-[35%] shrink-0 relative bg-neutral-900 overflow-hidden min-h-[220px] sm:min-h-full flex items-center justify-center">
        {achievement.photoUrl ? (
          <img
            src={achievement.photoUrl}
            alt={achievement.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
          />
        ) : (
          <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative">
            <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 mb-2 shadow-inner">
              <Trophy className="size-7 text-amber-400 drop-shadow" />
            </div>
            <p className="text-xs font-bold text-neutral-200 tracking-wide">Dokumentasi Prestasi</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">Departemen MB ITS</p>
          </div>
        )}

        {/* Floating Badges di atas Foto */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={getBadgeVariant(achievement.badgeVariant)} size="sm">
            <Trophy className="size-3" />
            {achievement.award}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[11px] font-mono font-bold bg-black/75 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full border border-white/20">
            {achievement.year}
          </span>
        </div>
      </div>

      {/* Sisi Kanan: Pencapaian, Penyelenggara, Rincian Mahasiswa & Deskripsi (Satu Kesatuan) */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
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
  );
};

