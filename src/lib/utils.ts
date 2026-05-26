import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function getImportanceColor(importance: string): string {
  switch (importance) {
    case 'catastrophic': return 'text-red-400 border-red-400/50'
    case 'critical': return 'text-orange-400 border-orange-400/50'
    case 'major': return 'text-yellow-400 border-yellow-400/50'
    case 'minor': return 'text-slate-400 border-slate-400/50'
    default: return 'text-slate-400 border-slate-400/50'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'past': return 'text-slate-500'
    case 'present': return 'text-emerald-400'
    case 'future': return 'text-blue-400'
    case 'inevitable': return 'text-red-400'
    case 'conditional': return 'text-yellow-400'
    case 'averted': return 'text-slate-600 line-through'
    default: return 'text-slate-400'
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '…'
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}
