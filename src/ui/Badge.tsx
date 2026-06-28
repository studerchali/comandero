import type { TableStatus } from '../types/restaurant'
import { t } from '../i18n/messages'

const STATUS_CONFIG: Record<TableStatus, { label: string; className: string }> = {
  libre: { label: t.tables.free, className: 'bg-cmd-surface-3 text-cmd-muted border-cmd-border' },
  ocupada: {
    label: t.tables.occupied,
    className: 'bg-cmd-warning/15 text-cmd-warning border-cmd-warning/30',
  },
  enviada: {
    label: t.tables.sent,
    className: 'bg-cmd-accent/15 text-cmd-accent border-cmd-accent/30',
  },
  cuenta: {
    label: t.tables.bill,
    className: 'bg-cmd-success/15 text-cmd-success border-cmd-success/30',
  },
}

const TONE_CONFIG = {
  success: 'bg-cmd-success/15 text-cmd-success border-cmd-success/30',
  warning: 'bg-cmd-warning/15 text-cmd-warning border-cmd-warning/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
} as const

export type BadgeVariant = 'default' | TableStatus | keyof typeof TONE_CONFIG

export interface BadgeProps {
  variant?: BadgeVariant
  label?: string
  size?: 'sm' | 'md'
}

export function Badge({ variant = 'default', label, size = 'md' }: BadgeProps) {
  const isTableStatus = variant in STATUS_CONFIG
  const isTone = variant in TONE_CONFIG
  const config = isTableStatus
    ? STATUS_CONFIG[variant as TableStatus]
    : isTone
      ? { label: label ?? '', className: TONE_CONFIG[variant as keyof typeof TONE_CONFIG] }
      : { label: label ?? '', className: 'bg-cmd-surface-3 text-cmd-muted border-cmd-border' }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizeClass}`}
    >
      {config.label || label}
    </span>
  )
}