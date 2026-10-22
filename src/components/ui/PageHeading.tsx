import React from 'react';
import { Badge } from './Badge';

interface PageHeadingProps {
  badge?: string;
  badgeVariant?: 'brand' | 'yellow' | 'neutral' | 'green';
  titlePrefix?: string;
  accentWord?: string;
  titleSuffix?: string;
  description?: string;
  children?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export const PageHeading: React.FC<PageHeadingProps> = ({
  badge,
  badgeVariant = 'yellow',
  titlePrefix,
  accentWord,
  titleSuffix,
  description,
  children,
  align = 'center',
  className = '',
}) => {
  const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`relative flex flex-col ${alignClass} py-12 sm:py-16 md:py-20 ${className}`}>
      {badge && (
        <div className="mb-4">
          <Badge variant={badgeVariant} size="md">
            {badge}
          </Badge>
        </div>
      )}

      <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.08] max-w-4xl">
        {titlePrefix && <span>{titlePrefix} </span>}
        {accentWord && (
          <span className="text-script text-blue-600 px-1 font-normal">
            {accentWord}
          </span>
        )}
        {titleSuffix && <span> {titleSuffix}</span>}
      </h1>

      {description && (
        <p className="mt-4 sm:mt-6 text-base sm:text-xl text-neutral-600 max-w-2xl font-light leading-relaxed">
          {description}
        </p>
      )}

      {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
    </div>
  );
};
