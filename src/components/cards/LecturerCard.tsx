'use client';

import React, { useState } from 'react';
import { Lecturer } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { getLecturerPhotoUrl, getLecturerInitials, getLecturerInterests, getLecturerRoleBadge } from '@/lib/lecturers';
import {
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Award
} from 'lucide-react';

interface LecturerCardProps {
  lecturer: Lecturer;
  onSelect: (lecturer: Lecturer) => void;
}

export const LecturerCard: React.FC<LecturerCardProps> = ({ lecturer, onSelect }) => {
  const [imageError, setImageError] = useState(false);
  const photoUrl = getLecturerPhotoUrl(lecturer);
  const initials = getLecturerInitials(lecturer.name);
  const interests = getLecturerInterests(lecturer);
  const roleBadge = getLecturerRoleBadge(lecturer);

  const scholarUrl = lecturer.google_scholar_url || lecturer.googleScholarUrl;
  const scopusUrl = lecturer.scopus_url || lecturer.scopusUrl;

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 hover:border-blue-500 hover:shadow-xl transition-all duration-300">
      <div>
        {/* Top Header with Portrait & Identity */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative size-20 sm:size-22 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 ring-4 ring-blue-50/80 border border-neutral-200/70 shadow-sm group-hover:scale-105 transition-transform duration-300">
            {photoUrl && !imageError ? (
              <img
                src={photoUrl}
                alt={`Foto profil ${lecturer.name}`}
                className="w-full h-full object-cover object-top"
                loading="lazy"
                decoding="async"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full grid place-items-center bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white font-bold text-xl sm:text-2xl shadow-inner">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <Badge variant="brand" size="sm">
                {roleBadge}
              </Badge>
              {lecturer.laboratory && (
                <Badge variant="yellow" size="sm">
                  {lecturer.laboratory.replace('Lab ', '').replace(' Laboratory', ' Lab')}
                </Badge>
              )}
            </div>

            <h3 className="text-base font-bold text-neutral-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
              {lecturer.name}
            </h3>

            {lecturer.nip && (
              <p className="text-xs text-neutral-500 font-mono mt-1 flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-neutral-400">NIP:</span>
                <span>{lecturer.nip}</span>
              </p>
            )}
          </div>
        </div>

        {/* Office & Location if available */}
        {lecturer.office && (
          <div className="py-2.5 px-3 mb-3.5 bg-neutral-50/80 rounded-xl border border-neutral-100 text-xs text-neutral-600 flex items-center gap-2 truncate">
            <MapPin className="size-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">{lecturer.office}</span>
          </div>
        )}

        {/* Research Interests / Fokus Riset */}
        {interests.length > 0 && (
          <div className="mt-3.5">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="size-3 text-blue-600" />
              <span>Minat Penelitian:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {interests.slice(0, 3).map((interest, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium bg-neutral-100 text-neutral-700 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 rounded-lg transition-colors border border-neutral-200/60 line-clamp-1"
                  title={interest}
                >
                  {interest}
                </span>
              ))}
              {interests.length > 3 && (
                <span className="text-[10px] font-semibold bg-neutral-50 text-neutral-500 px-2 py-1 rounded-lg border border-neutral-200/50">
                  +{interests.length - 3} lainnya
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions & Academic Links */}
      <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {scholarUrl && (
            <a
              href={scholarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition border border-blue-200/80"
              title="Buka profil Google Scholar resmi"
              aria-label={`Google Scholar ${lecturer.name}`}
            >
              <GraduationCap className="size-3.5" />
              <span className="hidden sm:inline">Scholar</span>
              <ExternalLink className="size-2.5 opacity-60" />
            </a>
          )}

          {scopusUrl && (
            <a
              href={scopusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 transition border border-amber-200/80"
              title="Buka profil Scopus resmi"
              aria-label={`Scopus ${lecturer.name}`}
            >
              <BookOpen className="size-3.5 text-amber-600" />
              <span className="hidden sm:inline">Scopus</span>
              <ExternalLink className="size-2.5 opacity-60" />
            </a>
          )}

          {!scholarUrl && !scopusUrl && lecturer.email && (
            <a
              href={`mailto:${lecturer.email}`}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-blue-600 transition"
              title={lecturer.email}
            >
              <Mail className="size-3.5" />
              <span className="truncate max-w-[120px]">{lecturer.email}</span>
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelect(lecturer)}
          className="inline-flex items-center gap-1 py-1.5 px-3 sm:px-3.5 rounded-full text-xs font-semibold bg-neutral-900 text-white hover:bg-blue-600 transition cursor-pointer shadow-xs shrink-0"
        >
          <span>Detail</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
};
