import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'brand' | 'dark' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  icon,
  variant = 'brand',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5 rounded-full',
    md: 'px-5 py-2.5 text-sm font-semibold gap-2 rounded-full',
    lg: 'px-7 py-3.5 text-base font-semibold gap-2.5 rounded-full',
  };

  const variantStyles = {
    brand: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:bg-blue-800',
    dark: 'bg-neutral-900 hover:bg-black text-white shadow-sm hover:shadow active:bg-neutral-800',
    yellow: 'bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold shadow-sm active:bg-amber-500',
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
