import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide' | 'full';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  size = 'default',
}) => {
  const sizeStyles = {
    narrow: 'max-w-4xl',
    default: 'max-w-[1440px]',
    wide: 'max-w-[1600px]',
    full: 'max-w-full',
  };

  return (
    <div className={`mx-auto w-full px-4 sm:px-8 lg:px-12 ${sizeStyles[size]} ${className}`}>
      {children}
    </div>
  );
};
