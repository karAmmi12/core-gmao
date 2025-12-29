/**
 * Composants de formulaires réutilisables
 * Gestion centralisée des formulaires avec validation
 */

'use client';

import { ReactNode, useActionState, useTransition, useState } from 'react';
import { cn } from '@/styles/design-system';
import { Button, Input, Textarea, Select, Card, Spinner } from '../ui';
import { Alert } from '../composite';

// =============================================================================
// FORM CONTAINER
// =============================================================================

export interface FormProps {
  children: ReactNode;
  onSubmit?: (formData: FormData) => void;
  className?: string;
}

export const Form = ({ children, onSubmit, className }: FormProps) => {
  return (
    <form 
      onSubmit={onSubmit ? (e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); } : undefined}
      className={cn('space-y-6', className)}
    >
      {children}
    </form>
  );
};

// =============================================================================
// FORM SECTION
// =============================================================================

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const FormSection = ({ title, description, children }: FormSectionProps) => {
  return (
    <Card>
      <div className="border-b border-neutral-200 pb-4 mb-4">
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        {description && <p className="text-sm text-neutral-500 mt-1">{description}</p>}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </Card>
  );
};

// =============================================================================
// FORM ROW (pour layout horizontal)
// =============================================================================

export interface FormRowProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
}

export const FormRow = ({ children, cols = 2 }: FormRowProps) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', colClasses[cols])}>
      {children}
    </div>
  );
};

// =============================================================================
// FORM ACTIONS
// =============================================================================

export interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const FormActions = ({ children, align = 'right' }: FormActionsProps) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={cn('flex items-center gap-3 pt-4 border-t border-neutral-200', alignClasses[align])}>
      {children}
    </div>
  );
};

// =============================================================================
// SEARCH INPUT
// =============================================================================

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  className?: string;
}

export const SearchInput = ({ value, onChange, placeholder = 'Rechercher...', name = 'search', className }: SearchInputProps) => {
  return (
    <div className={cn('relative', className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
        🔍
      </span>
      <input
        type="search"
        name={name}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      />
    </div>
  );
};

// =============================================================================
// FILTER SELECT
// =============================================================================

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  name?: string;
}

export const FilterSelect = ({ label, value, onChange, options, placeholder = 'Tous', name }: FilterSelectProps) => {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-neutral-600">{label}:</span>}
      <select
        name={name}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

// =============================================================================
// FILTERS BAR
// =============================================================================

export interface FiltersBarProps {
  children: ReactNode;
  onReset?: () => void;
}

export const FiltersBar = ({ children, onReset }: FiltersBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
      {children}
      {onReset && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Réinitialiser
        </Button>
      )}
    </div>
  );
};

// =============================================================================
// USE FORM HOOK (pour Server Actions)
// =============================================================================

export type FormState<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export function useForm<T = any>(
  action: (prevState: FormState<T>, formData: FormData) => Promise<FormState<T>>,
  initialState: FormState<T> = { success: false }
) {
  const [state, formAction] = useActionState(action, initialState);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return {
    state,
    formAction,
    isPending,
    handleSubmit,
    isSuccess: state.success,
    isError: !state.success && !!state.message,
    errors: state.errors || {},
    message: state.message,
    data: state.data,
  };
}

// =============================================================================
// SERVER ACTION FORM (Formulaire avec Server Actions intégré)
// =============================================================================

export interface ServerActionFormProps<T> {
  action: (prevState: FormState<T>, formData: FormData) => Promise<FormState<T>>;
  initialState?: FormState<T>;
  onSuccess?: (data: T) => void;
  children: (form: {
    isPending: boolean;
    errors: Record<string, string[]>;
    message?: string;
    isSuccess: boolean;
  }) => ReactNode;
  successMessage?: string;
  className?: string;
}

export function ServerActionForm<T = any>({
  action,
  initialState = { success: false },
  onSuccess,
  children,
  successMessage,
  className,
}: ServerActionFormProps<T>) {
  const [state, formAction] = useActionState(action, initialState);

  // Call onSuccess callback if needed
  if (state.success && state.data && onSuccess) {
    onSuccess(state.data);
  }

  return (
    <form action={formAction} className={cn('space-y-6', className)}>
      {state.success && successMessage && (
        <Alert variant="success">
          {successMessage}
        </Alert>
      )}
      
      {!state.success && state.message && (
        <Alert variant="danger">
          {state.message}
        </Alert>
      )}

      {children({
        isPending: false, // Server actions don't expose pending state directly
        errors: state.errors || {},
        message: state.message,
        isSuccess: state.success,
      })}
    </form>
  );
}

// =============================================================================
// DATE RANGE PICKER
// =============================================================================

export interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onStartChange?: (date: string) => void;
  onEndChange?: (date: string) => void;
  label?: string;
}

export const DateRangePicker = ({ startDate, endDate, onStartChange, onEndChange, label }: DateRangePickerProps) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={e => onStartChange?.(e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
        />
        <span className="text-neutral-400">→</span>
        <input
          type="date"
          value={endDate}
          onChange={e => onEndChange?.(e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
        />
      </div>
    </div>
  );
};

// =============================================================================
// CHECKBOX GROUP
// =============================================================================

export interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  label?: string;
  options: CheckboxOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  name?: string;
  direction?: 'horizontal' | 'vertical';
}

export const CheckboxGroup = ({ 
  label, 
  options, 
  value = [], 
  onChange, 
  name,
  direction = 'vertical' 
}: CheckboxGroupProps) => {
  const handleChange = (optValue: string, checked: boolean) => {
    if (checked) {
      onChange?.([...value, optValue]);
    } else {
      onChange?.(value.filter(v => v !== optValue));
    }
  };

  return (
    <fieldset>
      {label && <legend className="block text-sm font-medium text-neutral-700 mb-2">{label}</legend>}
      <div className={cn(
        'flex gap-4',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
      )}>
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name={name}
              value={opt.value}
              checked={value.includes(opt.value)}
              onChange={e => handleChange(opt.value, e.target.checked)}
              disabled={opt.disabled}
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

// =============================================================================
// RADIO GROUP
// =============================================================================

export interface RadioGroupProps {
  label?: string;
  options: CheckboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  direction?: 'horizontal' | 'vertical';
}

export const RadioGroup = ({ 
  label, 
  options, 
  value, 
  onChange, 
  name,
  direction = 'vertical' 
}: RadioGroupProps) => {
  return (
    <fieldset>
      {label && <legend className="block text-sm font-medium text-neutral-700 mb-2">{label}</legend>}
      <div className={cn(
        'flex gap-4',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
      )}>
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange?.(opt.value)}
              disabled={opt.disabled}
              className="w-4 h-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};
