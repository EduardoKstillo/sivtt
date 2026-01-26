import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea una fecha en formato legible
 */
export const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatString, { locale: es })
  } catch (error) {
    return '-'
  }
}

/**
 * Formatea una fecha con hora
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

/**
 * Formatea una fecha en formato relativo (hace 2 días)
 */
export const formatRelativeDate = (date) => {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
  } catch (error) {
    return '-'
  }
}

/**
 * Formatea un número como moneda
 */
export const formatCurrency = (amount, currency = 'PEN') => {
  if (amount === null || amount === undefined) return '-'
  
  const currencySymbols = {
    PEN: 'S/.',
    USD: '$',
    EUR: '€'
  }
  
  const symbol = currencySymbols[currency] || currency
  
  return `${symbol} ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

/**
 * Formatea un porcentaje
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(decimals)}%`
}

/**
 * Trunca un texto
 */
export const truncate = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}