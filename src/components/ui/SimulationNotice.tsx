import React from 'react';
import { Info, Sparkles } from 'lucide-react';

interface SimulationNoticeProps {
  actionName: string;
  backendRequirement: string;
  className?: string;
}

export const SimulationNotice: React.FC<SimulationNoticeProps> = ({
  actionName,
  backendRequirement,
  className = '',
}) => {
  return (
    <div
      className={`flex items-start gap-3 p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-xs text-amber-900 ${className}`}
      role="status"
    >
      <div className="shrink-0 p-1 bg-amber-200/60 rounded-lg text-amber-800">
        <Sparkles className="size-3.5" />
      </div>
      <div className="space-y-0.5">
        <p className="font-semibold text-amber-950">
          Simulasi Aksi Frontend: {actionName}
        </p>
        <p className="text-amber-800/90 text-[11px] leading-relaxed">
          Tindakan ini disimulasikan pada tahap frontend arsitektur. Pada fase implementasi lanjutan, aksi ini akan terhubung ke: <span className="font-medium underline decoration-amber-400">{backendRequirement}</span>.
        </p>
      </div>
    </div>
  );
};
