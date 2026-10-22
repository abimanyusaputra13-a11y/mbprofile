import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { SecondaryButton } from './SecondaryButton';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onReset?: () => void;
  resetText?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Tidak Ada Data Ditemukan',
  description = 'Coba ubah kata kunci pencarian atau atur ulang filter Anda untuk melihat hasil lainnya.',
  icon,
  onReset,
  resetText = 'Reset Filter',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-neutral-50/60 rounded-3xl border border-dashed border-neutral-300 max-w-xl mx-auto my-8 ${className}`}
    >
      <div className="grid place-items-center size-14 rounded-2xl bg-white shadow-xs border border-neutral-200 text-neutral-400 mb-4">
        {icon || <SearchX className="size-7 text-neutral-400" />}
      </div>
      <h3 className="text-lg font-bold text-neutral-900 mb-1.5">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {onReset && (
        <SecondaryButton
          variant="outline"
          size="sm"
          onClick={onReset}
          icon={<RotateCcw className="size-3.5" />}
        >
          {resetText}
        </SecondaryButton>
      )}
    </div>
  );
};
