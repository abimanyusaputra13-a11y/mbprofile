'use client';

import React, { useState } from 'react';
import { Resource } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { FileText, Download, Eye, Calendar, User, Check, Share2, Layers, BookOpen, ChevronRight } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onPreview: (resource: Resource) => void;
  onDownload: (resource: Resource) => void;
}

const FORMAT_BADGE_VARIANTS: Record<string, 'red' | 'yellow' | 'green' | 'brand'> = {
  PDF: 'red',
  ZIP: 'yellow',
  IPYNB: 'green',
};

function getFormatBadgeVariant(format: Resource['fileFormat']): 'red' | 'yellow' | 'green' | 'brand' {
  return FORMAT_BADGE_VARIANTS[format] || 'brand';
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onPreview,
  onDownload,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window === 'undefined' || !navigator.clipboard) return;
    const url = `${window.location.origin}/materi-soal?id=${resource.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
      <div>
        {/* Top Badges & Course Code */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono font-bold bg-neutral-900 text-white px-2.5 py-0.5 rounded-full">
              {resource.courseCode}
            </span>
            <Badge variant="brand" size="sm">
              Sem {resource.semester}
            </Badge>
            <Badge variant={getFormatBadgeVariant(resource.fileFormat)} size="sm">
              {resource.fileFormat} • {resource.fileSize}
            </Badge>
            {typeof resource.timeframe_views === 'number' && (
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                🔥 {resource.timeframe_views}x dilihat
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Salin tautan materi"
            title="Salin tautan materi"
            className="text-neutral-400 hover:text-blue-600 transition p-1.5 rounded-full hover:bg-neutral-50 cursor-pointer"
          >
            {copied ? <Check className="size-4 text-emerald-600" /> : <Share2 className="size-4" />}
          </button>
        </div>

        {/* Course Name / Category */}
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Layers className="size-3" />
          {resource.title === resource.courseName ? 'Mata Kuliah Resmi' : resource.courseName}
        </p>

        {/* Resource Title */}
        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {resource.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Metadata & Actions */}
      <div className="mt-5 pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-3">
          <span className="flex items-center gap-1 truncate max-w-[170px]" title={resource.author}>
            <User className="size-3 shrink-0" />
            <span className="truncate">{resource.author}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Calendar className="size-3" />
            {resource.uploadedAt}
          </span>
        </div>

        {/* Direct Link to Course / Weekly Topic Module */}
        {resource.courseId && (
          <div className="mb-2.5">
            {resource.weeklyTopicId ? (
              <a
                href={`/courses/${resource.courseId}/weeks/${resource.weeklyTopicId}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-xs border border-blue-200/80"
              >
                <BookOpen className="size-3.5" />
                <span>Buka Modul & Kuis (Mg {resource.weekNumber || 1})</span>
                <ChevronRight className="size-3" />
              </a>
            ) : (
              <a
                href={`/courses/${resource.courseId}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-neutral-900 text-white hover:bg-blue-600 transition shadow-xs"
              >
                <BookOpen className="size-3.5" />
                <span>Buka Silabus & Modul Mingguan</span>
                <ChevronRight className="size-3" />
              </a>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onPreview(resource)}
            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold border border-neutral-300 text-neutral-700 bg-neutral-50 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer"
          >
            <Eye className="size-3.5" />
            Pratinjau
          </button>
          <button
            type="button"
            onClick={() => onDownload(resource)}
            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
          >
            <Download className="size-3.5" />
            Unduh
          </button>
        </div>
      </div>
    </div>
  );
};
