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
        'rounded-xl shadow-sm border p-6',
        variant === 'default' && 'bg-white border-slate-200',
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
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      {badge && (
        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
};
