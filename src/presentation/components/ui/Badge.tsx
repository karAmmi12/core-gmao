import { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant: 'success' | 'warning' | 'danger' | 'neutral';
  icon?: ReactNode;
}

export const Badge = ({ children, variant, icon }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold',
        {
          'bg-green-100 text-green-700': variant === 'success',
          'bg-yellow-100 text-yellow-700': variant === 'warning',
          'bg-red-100 text-red-700': variant === 'danger',
          'bg-slate-100 text-slate-700': variant === 'neutral',
        }
      )}
    >
      {icon}
      {children}
    </span>
  );
};
