// Tipos de comprobante, con los mismos códigos que la columna "TIPO FACT." del Excel.
export const TIPOS = ["A", "B", "M", "FC", "NC", "ND"] as const
export type TipoComprobante = (typeof TIPOS)[number]

export const TIPO_LABEL: Record<TipoComprobante, string> = {
  A: "Factura A",
  B: "Factura B",
  M: "Factura M",
  FC: "Factura de crédito",
  NC: "Nota de crédito",
  ND: "Nota de débito",
}

// Tipos que solo se pueden emitir a un cliente con CUIT.
export const TIPOS_REQUIEREN_CUIT: TipoComprobante[] = ["A", "M", "FC"]

// Tipos que admiten venta sin cliente identificado (consumidor final).
export const TIPOS_SIN_CLIENTE: TipoComprobante[] = ["B"]

export function isTipo(value: unknown): value is TipoComprobante {
  return typeof value === "string" && (TIPOS as readonly string[]).includes(value)
}

export interface Cliente {
  id: number
  cuit: string | null
  razon_social: string
  email: string | null
  telefono: string | null
  direccion: string | null
}

// One line of a sale. Amounts are always positive and net of IVA; the sale's type gives the sign.
export interface VentaItem {
  id?: number
  articulo_id: number | null
  descripcion: string
  cantidad: number
  precio_unitario_ars: number
  alicuota_iva: number
  subtotal_ars: number
  articulos?: { referencia: string } | null
}

// Los importes se guardan con signo, como en el Excel: las notas de crédito en negativo.
export interface Venta {
  id: number
  tipo: TipoComprobante
  nro_comprobante: string
  fecha: string // YYYY-MM-DD
  cliente_id: number | null
  neto_ars: number
  iva_ars: number
  total_ars: number
  dolar: number
  // Stored (not derived): the historical Excel used different exchange rates over time.
  neto_usd: number
  iva_usd: number
  total_usd: number
  observacion: string | null
  clientes: { cuit: string | null; razon_social: string } | null
  ventas_items?: VentaItem[]
}

// Aplica el signo que corresponde al tipo: NC siempre resta; el resto se guarda como se ingresó
// (permite ajustes en negativo, que existen en el Excel).
export function applySign(tipo: TipoComprobante, n: number) {
  return tipo === "NC" ? -Math.abs(n) : n
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

export function formatCuit(cuit: string | null | undefined) {
  if (!cuit) return ""
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

// Type name for use inside a sentence: "factura A", "nota de crédito".
export function tipoEnTexto(tipo: TipoComprobante) {
  const label = TIPO_LABEL[tipo]
  return label[0].toLowerCase() + label.slice(1)
}
