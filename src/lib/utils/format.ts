import { format, formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Formatear moneda en euros
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(numAmount)
}

/**
 * Formatear fecha
 */
export function formatDate(date: Date | string, pattern: string = "dd/MM/yyyy"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, pattern, { locale: es })
}

/**
 * Formatear fecha y hora
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, "dd/MM/yyyy HH:mm")
}

/**
 * Formatear hora
 */
export function formatTime(date: Date | string): string {
  return formatDate(date, "HH:mm")
}

/**
 * Formatear tiempo relativo (hace 2 horas, hace 3 días)
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
}

/**
 * Formatear nombre completo
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}

/**
 * Formatear teléfono español
 */
export function formatPhone(phone: string): string {
  // Eliminar espacios y caracteres no numéricos
  const cleaned = phone.replace(/\D/g, "")

  // Formato: +34 XXX XX XX XX
  if (cleaned.length === 9) {
    return `+34 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`
  }

  return phone
}

/**
 * Truncar texto
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Generar iniciales de nombre
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Formatear porcentaje
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Formatear número con separadores de miles
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value)
}

/**
 * Generar slug de texto
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar espacios y caracteres especiales con -
    .replace(/^-+|-+$/g, "") // Eliminar - al inicio y final
}

/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validar teléfono español
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "")
  return cleaned.length === 9 && /^[6-9]/.test(cleaned)
}

/**
 * Generar código aleatorio
 */
export function generateCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Calcular progreso porcentual
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min((current / target) * 100, 100)
}
