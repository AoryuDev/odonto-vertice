import type { AppointmentStatus } from '@/modules/admin/agenda'

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Agendada',
  completed: 'Realizada',
  no_show: 'Faltou',
  cancelled: 'Cancelada',
}

export const STATUS_STYLES: Record<AppointmentStatus, string> = {
  scheduled: 'border-l-pine-700 bg-pine-100 text-pine-950',
  completed: 'border-l-ink-soft bg-paper-deep text-ink',
  no_show: 'border-l-clay-600 bg-clay-100 text-clay-700',
  cancelled: 'border-l-line-strong bg-card text-ink-soft line-through',
}
