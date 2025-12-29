/**
 * Composants UI atomiques - Design System GMAO
 * Tous les composants de base réutilisables
 */

'use client';

import { forwardRef, ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import Link from 'next/link';
import { 
  cn, 
  BUTTON_STYLES, 
  BADGE_STYLES, 
  CARD_STYLES, 
  INPUT_STYLES,
  STATUS_CONFIG,
  type ColorVariant,
  type Size,
} from '@/styles/design-system';

// =============================================================================
// BUTTON
// =============================================================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof BUTTON_STYLES.variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  children,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        BUTTON_STYLES.base,
        BUTTON_STYLES.variant[variant],
        BUTTON_STYLES.size[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner className="mr-2" />
      ) : icon && iconPosition === 'left' ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
});
Button.displayName = 'Button';

// =============================================================================
// LINK BUTTON
// =============================================================================

export interface LinkButtonProps {
  href: string;
  variant?: keyof typeof BUTTON_STYLES.variant;
  size?: Size;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const LinkButton = ({
  href,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
}: LinkButtonProps) => {
  return (
    <Link
      href={href}
      className={cn(
        BUTTON_STYLES.base,
        BUTTON_STYLES.variant[variant],
        BUTTON_STYLES.size[size],
        className
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Link>
  );
};

// =============================================================================
// BADGE
// =============================================================================

export interface BadgeProps {
  variant?: ColorVariant;
  color?: ColorVariant; // Alias for variant
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const Badge = ({
  variant,
  color,
  size = 'md',
  icon,
  className,
  children,
}: BadgeProps) => {
  const colorVariant = color || variant || 'neutral';
  return (
    <span className={cn(
      BADGE_STYLES.base,
      BADGE_STYLES.variant[colorVariant],
      BADGE_STYLES.size[size],
      className
    )}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
};

// =============================================================================
// STATUS BADGE - Automatique selon le type de statut
// =============================================================================

type StatusType = keyof typeof STATUS_CONFIG;

export interface StatusBadgeProps<T extends StatusType> {
  type: T;
  status: keyof typeof STATUS_CONFIG[T];
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge<T extends StatusType>({
  type,
  status,
  size = 'md',
  showIcon = true,
}: StatusBadgeProps<T>) {
  const config = STATUS_CONFIG[type][status] as { label: string; color: ColorVariant; icon?: string };
  
  return (
    <Badge variant={config.color} size={size}>
      {showIcon && config.icon && <span>{config.icon}</span>}
      {config.label}
    </Badge>
  );
}

// =============================================================================
// CARD
// =============================================================================

export interface CardProps {
  padding?: keyof typeof CARD_STYLES.padding;
  hover?: boolean;
  className?: string;
  children: ReactNode;
}

export const Card = ({
  padding = 'md',
  hover = false,
  className,
  children,
}: CardProps) => {
  return (
    <div className={cn(
      CARD_STYLES.base,
      CARD_STYLES.padding[padding],
      hover && CARD_STYLES.hover,
      className
    )}>
      {children}
    </div>
  );
};

// =============================================================================
// CARD HEADER
// =============================================================================

export interface CardHeaderProps {
  icon?: ReactNode;
  title: string;
  badge?: string;
  action?: ReactNode;
}

export const CardHeader = ({ icon, title, badge, action }: CardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <Badge variant="neutral" size="sm">{badge}</Badge>
        )}
        {action}
      </div>
    </div>
  );
};

// =============================================================================
// INPUT
// =============================================================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  inputSize = 'md',
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || props.name;
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          INPUT_STYLES.base,
          error ? INPUT_STYLES.variant.error : INPUT_STYLES.variant.default,
          INPUT_STYLES.size[inputSize],
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-danger-600">{error}</p>}
      {hint && !error && <p className="text-sm text-neutral-500">{hint}</p>}
    </div>
  );
});
Input.displayName = 'Input';

// =============================================================================
// TEXTAREA
// =============================================================================

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || props.name;
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={4}
        className={cn(
          INPUT_STYLES.base,
          error ? INPUT_STYLES.variant.error : INPUT_STYLES.variant.default,
          INPUT_STYLES.size.md,
          'resize-none',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-danger-600">{error}</p>}
      {hint && !error && <p className="text-sm text-neutral-500">{hint}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';

// =============================================================================
// SELECT
// =============================================================================

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: readonly SelectOption[] | SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  options,
  placeholder,
  children,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || props.name;
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={cn(
          INPUT_STYLES.base,
          error ? INPUT_STYLES.variant.error : INPUT_STYLES.variant.default,
          INPUT_STYLES.size.md,
          'cursor-pointer',
          className
        )}
        {...props}
      >
        {children ? children : (
          <>
            {placeholder && <option value="">{placeholder}</option>}
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </>
        )}
      </select>
      {error && <p className="text-sm text-danger-600">{error}</p>}
      {hint && !error && <p className="text-sm text-neutral-500">{hint}</p>}
    </div>
  );
});
Select.displayName = 'Select';

// =============================================================================
// SPINNER
// =============================================================================

export const Spinner = ({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
  
  return (
    <svg 
      className={cn('animate-spin', sizes[size], className)} 
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle 
        className="opacity-25" 
        cx="12" cy="12" r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// =============================================================================
// EMPTY STATE
// =============================================================================

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-neutral-900 mb-2">{title}</h3>
      {description && <p className="text-neutral-500 mb-4">{description}</p>}
      {action}
    </div>
  );
};

// =============================================================================
// SKELETON LOADERS
// =============================================================================

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('bg-neutral-200 rounded animate-pulse', className)} />
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn('h-4', i === lines - 1 && 'w-2/3')} 
      />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <Card>
    <Skeleton className="h-6 w-1/3 mb-4" />
    <SkeletonText />
  </Card>
);

// =============================================================================
// DIVIDER
// =============================================================================

export const Divider = ({ className }: { className?: string }) => (
  <hr className={cn('border-neutral-200', className)} />
);

// =============================================================================
// LABEL
// =============================================================================

export interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export const Label = ({ htmlFor, required, children, className }: LabelProps) => (
  <label 
    htmlFor={htmlFor} 
    className={cn('block text-sm font-medium text-neutral-700 mb-1', className)}
  >
    {children}
    {required && <span className="text-danger-500 ml-1">*</span>}
  </label>
);

// =============================================================================
// CHECKBOX
// =============================================================================

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  size = 'md',
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || props.name;
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <input
      ref={ref}
      type="checkbox"
      id={inputId}
      className={cn(
        sizes[size],
        'rounded border-neutral-300 text-primary-600',
        'focus:ring-primary-500 focus:ring-2 focus:ring-offset-0',
        'cursor-pointer transition-colors',
        className
      )}
      {...props}
    />
  );
});
Checkbox.displayName = 'Checkbox';

// =============================================================================
// FORM ERROR / SUCCESS MESSAGES
// =============================================================================

export const FormError = ({ message }: { message: string }) => (
  <div className="rounded-lg bg-danger-50 border border-danger-200 p-4 text-sm text-danger-700">
    <div className="flex items-center gap-2">
      <span>❌</span>
      <span>{message}</span>
    </div>
  </div>
);

export const FormSuccess = ({ message }: { message: string }) => (
  <div className="rounded-lg bg-success-50 border border-success-200 p-4 text-sm text-success-700">
    <div className="flex items-center gap-2">
      <span>✅</span>
      <span>{message}</span>
    </div>
  </div>
);

// =============================================================================
// MODAL - Composant modal générique réutilisable
// =============================================================================

const MODAL_STYLES = {
  overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
  container: {
    sm: 'max-w-md w-full',
    md: 'max-w-lg w-full',
    lg: 'max-w-2xl w-full',
    xl: 'max-w-4xl w-full',
  },
  scroll: 'max-h-[90vh] overflow-y-auto',
  header: 'flex justify-between items-center mb-4',
  title: 'text-xl font-bold text-gray-900',
  closeButton: 'text-gray-400 hover:text-gray-600 transition-colors',
} as const;

export interface ModalProps {
  title: string;
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ title, isOpen = true, onClose, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={MODAL_STYLES.overlay} onClick={onClose}>
      <div 
        className={cn(MODAL_STYLES.container[size], MODAL_STYLES.scroll, 'bg-white rounded-lg shadow-xl border border-neutral-200')}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className={MODAL_STYLES.header}>
          <h2 className={MODAL_STYLES.title}>{title}</h2>
          <button
            onClick={onClose}
            className={MODAL_STYLES.closeButton}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// LOGO - Re-export from separate file
// =============================================================================

export { Logo } from './Logo';
