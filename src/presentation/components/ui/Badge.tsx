import { ReactNode } from 'react';
import clsx from 'clsx';
import { badgeVariants, type BadgeVariant } from '@/styles/theme';

interface BadgeProps {
  children: ReactNode;
  variant: BadgeVariant;
  icon?: ReactNode;
}

export const Badge = ({ children, variant, icon }: BadgeProps) => {
  return (
    <span className={clsx(badgeVariants[variant], icon && 'gap-1.5')}>
      {icon}
      {children}
    </span>
  );
};
