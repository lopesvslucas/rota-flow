import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateLong(date: string): string {
  return format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatDateShort(date: string): string {
  return format(parseISO(date), 'dd/MM', { locale: ptBR })
}

export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1)
  return format(date, "MMMM 'de' yyyy", { locale: ptBR })
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export function formatCurrencyInput(value: number): string {
  if (value === 0) return ''
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function getMonthDateRange(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  return { startDate, endDate }
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}
