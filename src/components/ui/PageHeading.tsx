import React from 'react';

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
      {/* Yellow / custom badge removed per user request for a cleaner, unified display */}

      <h1 className="text-center font-bold tracking-tight text-neutral-900 leading-[0.95] max-w-5xl">
        {titlePrefix && (
          <span className="block text-[clamp(2.5rem,7vw,6.5rem)] font-bold">
            {titlePrefix}
          </span>
        )}
        {accentWord && (
          <span className="text-script block text-[clamp(2.75rem,8vw,7.5rem)] text-blue-600 font-normal mt-1">
            {accentWord}
            {titleSuffix && (
              <span className="not-italic font-bold text-neutral-900 ml-3">
                {titleSuffix}
              </span>
            )}
          </span>
        )}
        {!accentWord && titleSuffix && (
          <span className="block text-[clamp(2.5rem,7vw,6.5rem)] font-bold mt-1">
            {titleSuffix}
          </span>
        )}
      </h1>

      {description && (
        <p className="mt-6 sm:mt-8 text-base sm:text-xl text-neutral-600 max-w-2xl font-light leading-relaxed">
          {description}
        </p>
      )}

      {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
    </div>
  );
};
