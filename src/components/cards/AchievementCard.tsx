'use client';

import React from 'react';
import { Achievement } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Award, Users, GraduationCap, Calendar, Sparkles } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  onSelect?: (achievement: Achievement) => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onSelect }) => {
  const getBadgeVariant = (variant?: Achievement['badgeVariant']) => {
    switch (variant) {
      case 'gold':
        return 'yellow';
      case 'purple':
        return 'purple';
      case 'green':
        return 'green';
      default:
        return 'brand';
    }
  };

  return (
    <div
      onClick={() => onSelect?.(achievement)}
      className="group relative flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 hover:border-amber-400 hover:shadow-xl transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Top Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={getBadgeVariant(achievement.badgeVariant)} size="sm">
              <Trophy className="size-3" />
              {achievement.award}
            </Badge>
            <Badge variant="neutral" size="sm">
              {achievement.level}
            </Badge>
          </div>
          <span className="text-xs font-mono font-bold text-neutral-400">
            {achievement.year}
          </span>
        </div>

        {/* Title & Event */}
        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors leading-snug">
          {achievement.title}
        </h3>
        <p className="text-xs font-semibold text-neutral-500 mt-1">
          {achievement.eventOrganizer}
        </p>

        {/* Description */}
        <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
          {achievement.description}
        </p>

        {/* Team & Members */}
        <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5 text-xs">
          {achievement.teamName && (
            <p className="font-semibold text-blue-600 flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              {achievement.teamName}
            </p>
          )}
          <div className="flex items-start gap-1.5 text-neutral-600">
            <Users className="size-3.5 shrink-0 mt-0.5 text-neutral-400" />
            <p className="leading-snug">
              {achievement.members.join(', ')}
            </p>
          </div>
          {achievement.advisor && (
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <GraduationCap className="size-3 shrink-0" />
              <span>Dosen Pembina: {achievement.advisor}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
          Kategori: {achievement.category}
        </span>
        <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          Lihat Detail →
        </span>
      </div>
    </div>
  );
};
