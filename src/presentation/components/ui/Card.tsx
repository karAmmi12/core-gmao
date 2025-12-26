import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient';
  gradient?: string;
}

export const Card = ({ children, className, variant = 'default', gradient }: CardProps) => {
  return (
    <div
      className={clsx(
        variant === 'default' && 'card-base',
        variant === 'gradient' && gradient,
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  icon?: ReactNode;
  title: string;
  badge?: string;
}

export const CardHeader = ({ icon, title, badge }: CardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-heading">{title}</h3>
      </div>
      {badge && (
        <span className="badge-neutral">
          {badge}
        </span>
      )}
    </div>
  );
};
