import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  titlePrefix?: string;
  accentWord?: string;
  titleSuffix?: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  titlePrefix,
  accentWord,
  titleSuffix,
  description,
  align = 'center',
  className = '',
}) => {
  const alignClass = align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left';

  return (
    <div className={`flex flex-col ${alignClass} mb-10 sm:mb-14 max-w-3xl ${className}`}>
      {eyebrow && (
        <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-blue-600 mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.15]">
        {titlePrefix && <span>{titlePrefix} </span>}
        {accentWord && (
          <span className="text-script text-blue-600 px-1 font-normal">
            {accentWord}
          </span>
        )}
        {titleSuffix && <span> {titleSuffix}</span>}
      </h2>
      {description && (
        <p className="mt-3 text-sm sm:text-lg text-neutral-600 font-light leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
