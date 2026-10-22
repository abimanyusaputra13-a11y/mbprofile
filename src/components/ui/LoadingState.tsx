import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Memuat data akademik...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <Loader2 className="size-8 text-blue-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-neutral-600">{message}</p>
    </div>
  );
};
