// Aggregations for the sales dashboard. Pure functions over the full list of sales.
// All amounts are net (sin IVA) and signed: credit notes subtract.
import { TipoComprobante } from "./sales"

export type Moneda = "usd" | "ars"

export interface VentaResumen {
  fecha: string // YYYY-MM-DD
  tipo: TipoComprobante
  neto_ars: number
  neto_usd: number
  cliente_id: number | null
}

export interface ClienteResumen {
  id: number
  razon_social: string
  cuit: string | null
}

export const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

// Invoices (as opposed to credit/debit notes): what counts as "a sale" for ticket and frequency.
const TIPOS_FACTURA: TipoComprobante[] = ["A", "B", "M", "FC"]
const esFactura = (v: VentaResumen) => TIPOS_FACTURA.includes(v.tipo)

export const monto = (v: VentaResumen, moneda: Moneda) => (moneda === "usd" ? v.neto_usd : v.neto_ars)
const anioDe = (fecha: string) => Number(fecha.slice(0, 4))
const mesDe = (fecha: string) => Number(fecha.slice(5, 7))

export function normalizar(rows: Record<string, unknown>[]): VentaResumen[] {
  return rows.map((r) => ({
    fecha: String(r.fecha),
    tipo: r.tipo as TipoComprobante,
    neto_ars: Number(r.neto_ars),
    neto_usd: Number(r.neto_usd),
    cliente_id: r.cliente_id == null ? null : Number(r.cliente_id),
  }))
}

export function rangoFechas(ventas: VentaResumen[]) {
  let min = "9999-12-31"
  let max = "0000-01-01"
  for (const v of ventas) {
    if (v.fecha < min) min = v.fecha
    if (v.fecha > max) max = v.fecha
  }
  return { min, max }
}

export function aniosConVentas(ventas: VentaResumen[]) {
  return [...new Set(ventas.map((v) => anioDe(v.fecha)))].sort((a, b) => a - b)
}

export function filtrarAnios(ventas: VentaResumen[], desde: number, hasta: number) {
  return ventas.filter((v) => {
    const y = anioDe(v.fecha)
    return y >= desde && y <= hasta
  })
}

// ---------------------------------------------------------------- KPIs

export function kpis(ventas: VentaResumen[], moneda: Moneda) {
  let neto = 0
  let facturado = 0
  let notasCredito = 0
  let facturas = 0
  const clientes = new Set<number>()
  for (const v of ventas) {
    const n = monto(v, moneda)
    neto += n
    if (esFactura(v)) {
      facturado += n
      facturas++
    }
    if (v.tipo === "NC") notasCredito -= n
    if (v.cliente_id != null) clientes.add(v.cliente_id)
  }
  return {
    neto,
    facturas,
    ticket: facturas ? facturado / facturas : 0,
    notasCredito,
    ncPct: facturado ? notasCredito / facturado : 0,
    clientesActivos: clientes.size,
  }
}

// Same months of `anio` vs the previous year (Jan..last month with data in `anio`).
export function interanual(todas: VentaResumen[], anio: number, moneda: Moneda) {
  const delAnio = todas.filter((v) => anioDe(v.fecha) === anio)
  if (delAnio.length === 0) return null
  const mesHasta = Math.max(...delAnio.map((v) => mesDe(v.fecha)))
  let actual = 0
  let anterior = 0
  for (const v of todas) {
    const y = anioDe(v.fecha)
    if (mesDe(v.fecha) > mesHasta) continue
    if (y === anio) actual += monto(v, moneda)
    else if (y === anio - 1) anterior += monto(v, moneda)
  }
  if (anterior === 0) return null
  return { anio, mesHasta, actual, anterior, variacion: actual / anterior - 1 }
}

// ---------------------------------------------------------------- time series

export interface PuntoMensual {
  anio: number
  mes: number // 1..12
  valor: number
  comprobantes: number
}

// One point per month between `desde` and `hasta`, without months after the last sale.
export function serieMensual(ventas: VentaResumen[], moneda: Moneda, desde: number, hasta: number, ultimaFecha: string) {
  const mapa = new Map<string, PuntoMensual>()
  const ultimoAnio = anioDe(ultimaFecha)
  const ultimoMes = mesDe(ultimaFecha)
  for (let y = desde; y <= hasta; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y > ultimoAnio || (y === ultimoAnio && m > ultimoMes)) break
      mapa.set(`${y}-${m}`, { anio: y, mes: m, valor: 0, comprobantes: 0 })
    }
  }
  for (const v of ventas) {
    const p = mapa.get(`${anioDe(v.fecha)}-${mesDe(v.fecha)}`)
    if (!p) continue
    p.valor += monto(v, moneda)
    p.comprobantes++
  }
  return [...mapa.values()]
}

export function totalesAnuales(ventas: VentaResumen[], moneda: Moneda, desde: number, hasta: number) {
  const out = new Map<number, { anio: number; valor: number; facturas: number; meses: Set<number> }>()
  for (let y = desde; y <= hasta; y++) out.set(y, { anio: y, valor: 0, facturas: 0, meses: new Set() })
  for (const v of ventas) {
    const t = out.get(anioDe(v.fecha))
    if (!t) continue
    t.valor += monto(v, moneda)
    if (esFactura(v)) t.facturas++
    t.meses.add(mesDe(v.fecha))
  }
  return [...out.values()].map((t) => ({ anio: t.anio, valor: t.valor, facturas: t.facturas, meses: t.meses.size }))
}

// ---------------------------------------------------------------- seasonality (always in U$S: ARS is distorted by inflation)

// A year is complete when the data covers January through December.
function anioCompleto(y: number, primera: string, ultima: string) {
  return primera <= `${y}-01-31` && ultima >= `${y}-12-01`
}

export interface FilaEstacional {
  anio: number
  total: number
  // share of the year's sales in each month; null for months after the last sale
  shares: (number | null)[]
  completo: boolean
}

export function matrizEstacional(ventas: VentaResumen[], desde: number, hasta: number, primera: string, ultima: string) {
  const filas: FilaEstacional[] = []
  const ultimoAnio = anioDe(ultima)
  const ultimoMes = mesDe(ultima)
  for (let y = desde; y <= hasta; y++) {
    const porMes = new Array(12).fill(0)
    for (const v of ventas) if (anioDe(v.fecha) === y) porMes[mesDe(v.fecha) - 1] += v.neto_usd
    const total = porMes.reduce((a, b) => a + b, 0)
    const shares = porMes.map((x, i) =>
      y > ultimoAnio || (y === ultimoAnio && i + 1 > ultimoMes) ? null : total > 0 ? Math.max(0, x) / total : 0
    )
    filas.push({ anio: y, total, shares, completo: anioCompleto(y, primera, ultima) })
  }
  return filas
}

// Average monthly index over complete years: 100 = an average month, 150 = 50% above average.
export function indiceMensual(filas: FilaEstacional[]) {
  const completas = filas.filter((f) => f.completo && f.total > 0)
  if (completas.length === 0) return { indice: null, anios: [] as number[] }
  const indice = MESES_CORTOS.map(
    (_, i) => (completas.reduce((acc, f) => acc + (f.shares[i] ?? 0), 0) / completas.length) * 12 * 100
  )
  return { indice, anios: completas.map((f) => f.anio) }
}

// ---------------------------------------------------------------- clients

export interface ClienteStats {
  id: number
  nombre: string
  cuit: string | null
  total: number
  facturas: number
  primera: string
  ultima: string
  share: number
  acumulado: number
  actual: number // year-to-date of the comparison year
  anterior: number // same months of the previous year
}

export function rankingClientes(
  ventas: VentaResumen[],
  clientes: Map<number, ClienteResumen>,
  moneda: Moneda,
  comparacion: { anio: number; mesHasta: number } | null
) {
  const mapa = new Map<number, ClienteStats>()
  let consumidorFinal = 0
  let total = 0
  for (const v of ventas) {
    const n = monto(v, moneda)
    total += n
    if (v.cliente_id == null) {
      consumidorFinal += n
      continue
    }
    let c = mapa.get(v.cliente_id)
    if (!c) {
      const info = clientes.get(v.cliente_id)
      c = {
        id: v.cliente_id,
        nombre: info?.razon_social ?? `Cliente ${v.cliente_id}`,
        cuit: info?.cuit ?? null,
        total: 0,
        facturas: 0,
        primera: v.fecha,
        ultima: v.fecha,
        share: 0,
        acumulado: 0,
        actual: 0,
        anterior: 0,
      }
      mapa.set(v.cliente_id, c)
    }
    c.total += n
    if (esFactura(v)) c.facturas++
    if (v.fecha < c.primera) c.primera = v.fecha
    if (v.fecha > c.ultima) c.ultima = v.fecha
    if (comparacion && mesDe(v.fecha) <= comparacion.mesHasta) {
      const y = anioDe(v.fecha)
      if (y === comparacion.anio) c.actual += n
      else if (y === comparacion.anio - 1) c.anterior += n
    }
  }
  const ranking = [...mapa.values()].sort((a, b) => b.total - a.total)
  let acc = 0
  for (const c of ranking) {
    c.share = total ? c.total / total : 0
    acc += c.share
    c.acumulado = acc
  }
  return { ranking, consumidorFinal, total }
}

// Smallest number of clients that make up `objetivo` of sales (e.g. 80%).
export function clientesParaPorcentaje(ranking: ClienteStats[], objetivo: number) {
  const i = ranking.findIndex((c) => c.acumulado >= objetivo)
  return i === -1 ? ranking.length : i + 1
}

export type TipoEstacionalidad = "fin" | "mitad" | "otro" | "parejo"

export interface Estacionalidad {
  shares: number[] // share of sales by calendar month (all years together)
  ventana: { desde: number; share: number } // best 3-month window (0-based start month, wraps around)
  tipo: TipoEstacionalidad
}

export interface EstacionalidadCliente extends Estacionalidad {
  id: number
}

// Seasonality from amounts per calendar month (Jan..Dec). Seasonal when 3 consecutive months
// concentrate at least half of the total (twice what an even spread would give).
export function estacionalidadDeMeses(porMes: number[]): Estacionalidad {
  const positivos = porMes.map((x) => Math.max(0, x))
  const total = positivos.reduce((a, b) => a + b, 0)
  const shares = positivos.map((x) => (total ? x / total : 0))

  let mejor = { desde: 0, share: -1 }
  for (let i = 0; i < 12; i++) {
    const s = shares[i] + shares[(i + 1) % 12] + shares[(i + 2) % 12]
    if (s > mejor.share) mejor = { desde: i, share: s }
  }
  const centro = (mejor.desde + 1) % 12
  const tipo: TipoEstacionalidad =
    mejor.share < 0.5 ? "parejo" : [10, 11, 0].includes(centro) ? "fin" : [5, 6, 7].includes(centro) ? "mitad" : "otro"
  return { shares, ventana: mejor, tipo }
}

// Seasonality per client, in U$S.
export function estacionalidadCliente(ventas: VentaResumen[], id: number): EstacionalidadCliente {
  const porMes = new Array(12).fill(0)
  for (const v of ventas) if (v.cliente_id === id) porMes[mesDe(v.fecha) - 1] += v.neto_usd
  return { id, ...estacionalidadDeMeses(porMes) }
}

export function etiquetaVentana(desde: number) {
  return `${MESES_CORTOS[desde]}–${MESES_CORTOS[(desde + 2) % 12]}`
}

// Enough history to talk about seasonality: invoices in at least 2 different years and 4 invoices overall.
export function tieneHistoria(ventas: VentaResumen[], id: number) {
  const anios = new Set<number>()
  let facturas = 0
  for (const v of ventas) {
    if (v.cliente_id !== id || !esFactura(v)) continue
    anios.add(anioDe(v.fecha))
    facturas++
  }
  return anios.size >= 2 && facturas >= 4
}

// New, retained and lost clients per year (computed over all history so "new" means first purchase ever).
export function altasYBajas(todas: VentaResumen[], primera: string, ultima: string) {
  const porAnio = new Map<number, Set<number>>()
  const primerAnio = new Map<number, number>()
  for (const v of todas) {
    if (v.cliente_id == null || !esFactura(v)) continue
    const y = anioDe(v.fecha)
    if (!porAnio.has(y)) porAnio.set(y, new Set())
    porAnio.get(y)!.add(v.cliente_id)
    primerAnio.set(v.cliente_id, Math.min(primerAnio.get(v.cliente_id) ?? y, y))
  }
  const anios = [...porAnio.keys()].sort((a, b) => a - b)
  return anios.map((y) => {
    const activos = porAnio.get(y)!
    const previos = porAnio.get(y - 1)
    let nuevos = 0
    for (const id of activos) if (primerAnio.get(id) === y) nuevos++
    let perdidos: number | null = null
    if (previos && anioCompleto(y, primera, ultima)) {
      perdidos = 0
      for (const id of previos) if (!activos.has(id)) perdidos++
    }
    return { anio: y, activos: activos.size, nuevos, recurrentes: activos.size - nuevos, perdidos }
  })
}

// Good historical clients (by U$S) with no purchase in the last `meses` months.
export function clientesInactivos(
  todas: VentaResumen[],
  clientes: Map<number, ClienteResumen>,
  ultima: string,
  meses = 12,
  limite = 10
) {
  const corte = new Date(`${ultima}T00:00:00`)
  corte.setMonth(corte.getMonth() - meses)
  const corteISO = corte.toISOString().slice(0, 10)
  const { ranking } = rankingClientes(todas, clientes, "usd", null)
  return ranking.filter((c) => c.ultima < corteISO && c.total > 0).slice(0, limite)
}

// ---------------------------------------------------------------- formatting

const compact = new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 })
const entero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 })
const conDecimales = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function simbolo(moneda: Moneda) {
  return moneda === "usd" ? "U$S" : "$"
}

export function fmtCompacto(n: number, moneda: Moneda) {
  return `${simbolo(moneda)} ${compact.format(n)}`
}

export function fmtMonto(n: number, moneda: Moneda, decimales = false) {
  return `${simbolo(moneda)} ${(decimales ? conDecimales : entero).format(n)}`
}

export function fmtPct(n: number, decimales = 1) {
  return `${(n * 100).toLocaleString("es-AR", { maximumFractionDigits: decimales, minimumFractionDigits: 0 })}%`
}

export function fmtNumero(n: number) {
  return entero.format(n)
}
