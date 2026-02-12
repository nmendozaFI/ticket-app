import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date))
}

  export function formatDateForInput(dateValue: Date | string | null | undefined): string {
    // ✅ Maneja string ISO, Date, o null
    if (!dateValue) return ""
    if (typeof dateValue === 'string') {
      return dateValue.split('T')[0] // "2026-02-12T00:00:00Z" → "2026-02-12"
    }
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0]
    }
    return ""
  }