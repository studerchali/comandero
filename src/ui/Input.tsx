import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-cmd-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-cmd-border bg-cmd-surface-2 px-4 py-3.5 text-base text-cmd-text placeholder:text-cmd-muted/50 focus:border-cmd-accent focus:outline-none focus:ring-2 focus:ring-cmd-accent/30 disabled:opacity-50 ${error ? 'border-cmd-danger' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-cmd-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}