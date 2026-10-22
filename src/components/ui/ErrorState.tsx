import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { SecondaryButton } from './SecondaryButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Gagal Memuat Konten',
  message = 'Terjadi kendala saat menghubungkan sumber data. Silakan coba beberapa saat lagi.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-rose-50/50 rounded-3xl border border-rose-200 max-w-lg mx-auto my-8 ${className}`}
    >
      <div className="grid place-items-center size-12 rounded-full bg-rose-100 text-rose-600 mb-4">
        <AlertCircle className="size-6" />
      </div>
      <h3 className="text-base font-bold text-rose-950 mb-1">{title}</h3>
      <p className="text-xs text-rose-800/80 mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <SecondaryButton
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw className="size-3.5" />}
        >
          Coba Lagi
        </SecondaryButton>
      )}
    </div>
  );
};
