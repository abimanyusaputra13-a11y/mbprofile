'use client';

import React from 'react';
import { DocumentReport } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { FileText, Download, Eye, CheckCircle2, Building2, Calendar } from 'lucide-react';

interface DocumentCardProps {
  document: DocumentReport;
  onPreview: (doc: DocumentReport) => void;
  onDownload: (doc: DocumentReport) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  onDownload,
}) => {
  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
      <div>
        {/* Top Code & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-mono font-semibold bg-neutral-100 text-neutral-800 px-3 py-1 rounded-full border border-neutral-200">
            {document.documentCode}
          </span>
          <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="size-3" />
            <span>{document.status}</span>
          </div>
        </div>

        {/* Category Badge */}
        <div className="mb-2">
          <Badge variant="brand" size="sm">
            {document.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors leading-snug">
          {document.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-neutral-600 mt-2.5 line-clamp-3 leading-relaxed">
          {document.description}
        </p>

        {/* Issuing Body */}
        <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Building2 className="size-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">{document.issuingBody}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="size-3 text-neutral-400" />
              Dipublikasi: {document.publishDate}
            </span>
            <span className="font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
              {document.fileFormat} • {document.fileSize}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onPreview(document)}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold border border-neutral-300 text-neutral-700 bg-neutral-50 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer"
        >
          <Eye className="size-3.5" />
          Lihat Detail
        </button>
        <button
          type="button"
          onClick={() => onDownload(document)}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold bg-neutral-900 text-white hover:bg-blue-600 transition cursor-pointer shadow-xs"
        >
          <Download className="size-3.5" />
          Unduh Salinan
        </button>
      </div>
    </div>
  );
};
