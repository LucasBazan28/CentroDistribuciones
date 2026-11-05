export type TipoComprobante = "factura" | "nota_credito"

export interface Cliente {
  id: number
  cuit: string
  razon_social: string
  email: string | null
  telefono: string | null
  direccion: string | null
}

export interface Venta {
  id: number
  tipo: TipoComprobante
  nro_comprobante: string
  fecha: string // YYYY-MM-DD
  cliente_id: number
  neto_ars: number
  iva_ars: number
  total_ars: number
  dolar: number
  observacion: string | null
  clientes: { cuit: string; razon_social: string } | null
}

export const TIPO_LABEL: Record<TipoComprobante, string> = {
  factura: "Factura",
  nota_credito: "Nota de crédito",
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

// Checks an Argentine CUIT/CUIL using its verification digit.
export function isValidCuit(raw: string) {
  const cuit = onlyDigits(raw)
  if (cuit.length !== 11) return false
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const sum = weights.reduce((acc, w, i) => acc + w * Number(cuit[i]), 0)
  let check = 11 - (sum % 11)
  if (check === 11) check = 0
  if (check === 10) return false
  return check === Number(cuit[10])
}

export function formatCuit(cuit: string) {
  const d = onlyDigits(cuit)
  if (d.length !== 11) return cuit
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`
}

export function padComprobante(value: string) {
  const d = onlyDigits(value).slice(-8)
  return d ? d.padStart(8, "0") : ""
}

export function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 })
    .format(n)
}

export function formatUSD(n: number) {
  return "U$S " + new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export function formatFecha(fecha: string) {
  const [y, m, d] = fecha.split("-")
  return `${d}/${m}/${y}`
}

// Local date as YYYY-MM-DD (avoids the UTC shift of toISOString).
export function todayISO() {
  const now = new Date()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${m}-${d}`
}
