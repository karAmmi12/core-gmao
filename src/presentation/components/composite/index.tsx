/**
 * Composants composites réutilisables
 * Assemblages de composants atomiques pour des patterns communs
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn, formatCurrency, formatNumber, type ColorVariant } from '@/styles/design-system';
import { Card, Badge, Button, LinkButton, EmptyState, Skeleton } from '../ui';

// =============================================================================
// PAGE HEADER
// =============================================================================

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export const PageHeader = ({ title, description, icon, actions, breadcrumbs }: PageHeaderProps) => {
  return (
    <div className="mb-4 sm:mb-6 lg:mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-neutral-500 mb-3 sm:mb-4 overflow-x-auto">
          {breadcrumbs.map((item, idx) => (
            <span key={idx} className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
              {idx > 0 && <span>/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-neutral-700 active:text-neutral-900 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-neutral-700">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 flex items-center gap-2 sm:gap-3">
            {icon && <span className="text-lg sm:text-xl lg:text-2xl">{icon}</span>}
            <span className="truncate">{title}</span>
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-neutral-600 mt-1 sm:mt-2">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// STAT CARD
// =============================================================================

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label?: string };
  color?: ColorVariant;
  href?: string;
}

export const StatCard = ({ label, value, subtitle, icon, trend, color = 'neutral', href }: StatCardProps) => {
  const colorClasses: Record<ColorVariant, string> = {
    primary: 'bg-primary-50 border-primary-200',
    success: 'bg-success-50 border-success-200',
    warning: 'bg-warning-50 border-warning-200',
    danger: 'bg-danger-50 border-danger-200',
    neutral: 'bg-white border-neutral-200',
  };

  const content = (
    <div className={cn(
      'rounded-lg sm:rounded-xl border p-3 sm:p-4 lg:p-5',
      colorClasses[color],
      href && 'hover:shadow-md active:shadow-sm transition-shadow cursor-pointer'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-500 truncate">{label}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 mt-0.5 sm:mt-1">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {subtitle && <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 sm:mt-1 truncate">{subtitle}</p>}
        </div>
        {icon && <div className="text-lg sm:text-xl lg:text-2xl shrink-0">{icon}</div>}
      </div>
      {trend && (
        <div className={cn(
          'mt-2 sm:mt-3 text-xs sm:text-sm font-medium',
          trend.value >= 0 ? 'text-success-600' : 'text-danger-600'
        )}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          {trend.label && <span className="text-neutral-500 ml-1">{trend.label}</span>}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};

// =============================================================================
// STATS GRID (Mobile-First)
// =============================================================================

export interface StatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
}

export const StatsGrid = ({ children, columns = 4 }: StatsGridProps) => {
  const colClasses = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <div className={cn('grid gap-2 sm:gap-3 lg:gap-4', colClasses[columns])}>
      {children}
    </div>
  );
};

// =============================================================================
// DATA TABLE (Mobile-First with responsive card view)
// =============================================================================

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  /** Hide this column on mobile */
  hideOnMobile?: boolean;
  /** Show as primary field in mobile card view */
  primary?: boolean;
  render?: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  emptyState?: { icon?: ReactNode; title: string; description?: string; action?: ReactNode };
  loading?: boolean;
  /** Force card view on all screen sizes */
  cardView?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  onRowClick,
  emptyState,
  loading,
  cardView = false,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 sm:h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <EmptyState {...emptyState} />;
  }

  // Mobile card view
  const MobileCardView = () => (
    <div className="space-y-2 sm:hidden">
      {data.map((row, idx) => (
        <div
          key={String(row[keyField])}
          onClick={() => onRowClick?.(row)}
          className={cn(
            'bg-white rounded-lg border border-neutral-200 p-3',
            'active:bg-neutral-50 transition-colors',
            onRowClick && 'cursor-pointer'
          )}
        >
          {columns.map(col => {
            const value = col.render ? col.render(row, idx) : row[col.key];
            return (
              <div key={col.key} className={cn(
                'flex justify-between items-center py-1',
                col.primary && 'font-medium text-neutral-900'
              )}>
                <span className="text-xs text-neutral-500">{col.header}</span>
                <span className="text-sm">{value}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  // Desktop table view
  const DesktopTableView = () => (
    <div className={cn('overflow-x-auto', cardView ? 'block' : 'hidden sm:block')}>
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            {columns.filter(col => !col.hideOnMobile).map(col => (
              <th
                key={col.key}
                className={cn(
                  'px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-neutral-600 uppercase tracking-wide whitespace-nowrap',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.align !== 'center' && col.align !== 'right' && 'text-left'
                )}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {data.map((row, idx) => (
            <tr
              key={String(row[keyField])}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'hover:bg-neutral-50 active:bg-neutral-100 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.filter(col => !col.hideOnMobile).map(col => (
                <td
                  key={col.key}
                  className={cn(
                    'px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.render ? col.render(row, idx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {!cardView && <MobileCardView />}
      <DesktopTableView />
    </>
  );
}

// =============================================================================
// TABLE CARD (Table avec header et wrapper)
// =============================================================================

export interface TableCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export const TableCard = ({ title, subtitle, actions, children }: TableCardProps) => {
  return (
    <Card padding="none">
      <div className="p-6 border-b border-neutral-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </Card>
  );
};

// =============================================================================
// TABS
// =============================================================================

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

export interface TabsProps {
  tabs: readonly Tab[] | Tab[];
  activeTab: string;
  onChange?: (tabId: string) => void;
  basePath?: string; // Pour navigation par URL
}

export const Tabs = ({ tabs, activeTab, onChange, basePath }: TabsProps) => {
  return (
    <div className="border-b border-neutral-200">
      <nav className="flex gap-4">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const className = cn(
            'pb-3 px-1 border-b-2 text-sm font-medium transition-colors',
            isActive
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          );

          if (basePath) {
            return (
              <Link key={tab.id} href={`${basePath}?tab=${tab.id}`} className={className}>
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </Link>
            );
          }

          return (
            <button key={tab.id} onClick={() => onChange?.(tab.id)} className={className}>
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// =============================================================================
// ALERT
// =============================================================================

export interface AlertProps {
  variant?: ColorVariant;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
}

export const Alert = ({ variant = 'primary', title, children, icon, onClose }: AlertProps) => {
  const variantClasses: Record<ColorVariant, string> = {
    primary: 'bg-primary-50 border-primary-200 text-primary-800',
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    danger: 'bg-danger-50 border-danger-200 text-danger-800',
    neutral: 'bg-neutral-50 border-neutral-200 text-neutral-800',
  };

  return (
    <div className={cn('rounded-lg border p-4 flex gap-3', variantClasses[variant])}>
      {icon && <div className="shrink-0">{icon}</div>}
      <div className="flex-1">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
};

// =============================================================================
// DROPDOWN MENU
// =============================================================================

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export const Dropdown = ({ trigger, items, align = 'right' }: DropdownProps) => {
  return (
    <div className="relative group">
      {trigger}
      <div className={cn(
        'absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20',
        'invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200',
        align === 'right' ? 'right-0' : 'left-0'
      )}>
        {items.map((item, idx) => {
          const className = cn(
            'w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors',
            item.danger 
              ? 'text-danger-600 hover:bg-danger-50' 
              : 'text-neutral-700 hover:bg-neutral-50'
          );

          if (item.href) {
            return (
              <Link key={idx} href={item.href} className={className}>
                {item.icon}
                {item.label}
              </Link>
            );
          }

          return (
            <button key={idx} onClick={item.onClick} className={className}>
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// PROGRESS BAR
// =============================================================================

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ColorVariant;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar = ({ 
  value, 
  max = 100, 
  color = 'primary', 
  showLabel = false,
  size = 'md' 
}: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = { sm: 'h-1', md: 'h-2', lg: 'h-3' };
  const colorClasses: Record<ColorVariant, string> = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    neutral: 'bg-neutral-500',
  };

  return (
    <div>
      <div className={cn('w-full bg-neutral-100 rounded-full overflow-hidden', sizeClasses[size])}>
        <div 
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-neutral-500 mt-1">{percentage.toFixed(0)}%</p>
      )}
    </div>
  );
};

// =============================================================================
// AVATAR
// =============================================================================

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = ({ name, src, size = 'md' }: AvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (src) {
    return (
      <img 
        src={src} 
        alt={name} 
        className={cn('rounded-full object-cover', sizeClasses[size])} 
      />
    );
  }

  return (
    <div className={cn(
      'rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold',
      sizeClasses[size]
    )}>
      {initials}
    </div>
  );
};
