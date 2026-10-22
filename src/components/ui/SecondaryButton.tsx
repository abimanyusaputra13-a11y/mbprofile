import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'outline' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  icon,
  variant = 'outline',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5 rounded-full',
    md: 'px-5 py-2.5 text-sm font-semibold gap-2 rounded-full',
    lg: 'px-6 py-3.5 text-base font-semibold gap-2.5 rounded-full',
  };

  const variantStyles = {
    outline: 'border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100',
    ghost: 'border border-transparent bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
    soft: 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200',
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
