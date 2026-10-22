import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'yellow' | 'neutral' | 'green' | 'purple' | 'red';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    brand: 'bg-blue-50 text-blue-700 border border-blue-200',
    yellow: 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold',
    neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    red: 'bg-rose-50 text-rose-700 border border-rose-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap tracking-wide ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
