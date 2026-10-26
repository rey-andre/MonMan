/**
 * Format number into IDR currency format
 * e.g. 15500000 -> "Rp 15.500.000"
 */
export function formatIdr(amount, withPrefix = true) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return withPrefix ? 'Rp 0' : '0'
  }
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
  }).format(amount)
  
  return withPrefix ? `Rp ${formatted}` : formatted
}

/**
 * Format crypto amount with high precision (up to 10 decimals)
 * As required by PRD 4.4:
 * "Gunakan konfigurasi Intl.NumberFormat('id-ID', { maximumFractionDigits: 10 })"
 */
export function formatCrypto(amount, maxDigits = 10) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0'
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDigits
  }).format(num)
}

export const formatCryptoAmount = formatCrypto

/**
 * Format USD currency
 */
export function formatUsd(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(amount)
}

/**
 * Human-friendly date formatter in Indonesian
 */
export function formatRelativeDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const today = new Date()
  
  const isToday = date.toDateString() === today.toDateString()
  if (isToday) return 'Hari ini'
  
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Kemarin'
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  }).format(date)
}

/**
 * Compact format for abbreviated large amounts (e.g. 5.000.000 -> 5.0 Jt)
 */
export function formatShortIdr(val) {
  if (val === undefined || val === null || isNaN(val)) return '0'
  const num = Number(val)
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' M'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + ' Jt'
  if (num >= 1000) return (num / 1000).toFixed(0) + ' Rb'
  return String(num)
}

/**
 * Privacy masking helper
 */
export function formatPrivacy(val, isPrivacy = false, mask = '••••••••') {
  return isPrivacy ? mask : val
}
