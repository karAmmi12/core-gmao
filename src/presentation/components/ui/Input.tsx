import { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'input-base bg-neutral-50 text-sm',
          error && 'border-danger-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-danger-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = ({ label, error, children, className, ...props }: SelectProps) => {
  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'input-base bg-neutral-50 text-sm',
          error && 'border-danger-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-danger-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
