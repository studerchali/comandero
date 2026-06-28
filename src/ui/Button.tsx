import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
export type ButtonSize = 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-cmd-accent text-white hover:bg-cmd-accent-dim active:scale-[0.97] shadow-lg shadow-cmd-accent/20',
  secondary:
    'bg-cmd-surface-2 text-cmd-text border border-cmd-border hover:bg-cmd-surface-3 active:scale-[0.97]',
  danger: 'bg-cmd-danger text-white hover:bg-cmd-danger/90 active:scale-[0.97]',
  ghost:
    'bg-transparent text-cmd-muted hover:bg-cmd-surface-2 hover:text-cmd-text active:scale-[0.97]',
  success: 'bg-cmd-success text-cmd-bg hover:bg-cmd-success/90 active:scale-[0.97]',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-12 px-4 py-2.5 text-sm',
  lg: 'min-h-14 px-5 py-3 text-base',
  xl: 'min-h-16 px-6 py-4 text-lg font-semibold',
}

export function Button({
  children,
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cmd-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cmd-bg disabled:pointer-events-none disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}