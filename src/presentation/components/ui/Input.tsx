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
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-orange-500',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-orange-500',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
