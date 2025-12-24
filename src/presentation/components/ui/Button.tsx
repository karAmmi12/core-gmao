import { ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        'font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-orange-600 hover:bg-orange-500 text-white': variant === 'primary',
          'bg-slate-200 hover:bg-slate-300 text-slate-700': variant === 'secondary',
          'bg-green-600 hover:bg-green-500 text-white': variant === 'success',
          'bg-red-600 hover:bg-red-500 text-white': variant === 'danger',
          'py-1.5 px-3 text-xs': size === 'sm',
          'py-2.5 px-4 text-sm': size === 'md',
          'py-3 px-6 text-base': size === 'lg',
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Chargement...' : children}
    </button>
  );
};
