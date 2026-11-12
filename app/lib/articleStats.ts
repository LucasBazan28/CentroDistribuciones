// Aggregations of sale line items (ventas_items) for the dashboard's articles section.
// Line amounts are stored positive; here they get the sign of their sale (credit notes subtract).
import { TipoComprobante, applySign } from "./sales"
import { Estacionalidad, Moneda, estacionalidadDeMeses } from "./salesStats"

export interface ItemResumen {
  venta_id: number
  clave: string // article id, or the description for lines outside the catalog
  articulo_id: number | null
  referencia: string | null
  descripcion: string
  marca: string | null
  categoria: string | null
  cantidad: number // signed
  monto_ars: number // net, signed
  monto_usd: number // net, signed
  fecha: string
  tipo: TipoComprobante
  cliente_id: number | null
  venta_neto_usd: number // whole sale, to measure coverage
}

type Fila = Record<string, unknown> & {
  ventas?: { fecha: string; tipo: TipoComprobante; dolar: number; cliente_id: number | null; neto_usd: number } | null
  articulos?: { referencia: string; marcas?: { nombre: string } | null; categorias?: { nombre: string } | null } | null
}

export function normalizarItems(rows: Fila[]): ItemResumen[] {
  const out: ItemResumen[] = []
  for (const r of rows) {
    const v = r.ventas
    if (!v) continue
    const sub = Number(r.subtotal_ars)
    const dolar = Number(v.dolar)
    const articuloId = r.articulo_id == null ? null : Number(r.articulo_id)
    const descripcion = String(r.descripcion).trim()
    out.push({
      venta_id: Number(r.venta_id),
      clave: articuloId != null ? `a${articuloId}` : `d${descripcion.toUpperCase()}`,
      articulo_id: articuloId,
      referencia: r.articulos?.referencia ?? null,
      descripcion,
      marca: r.articulos?.marcas?.nombre ?? null,
      categoria: r.articulos?.categorias?.nombre ?? null,
      cantidad: applySign(v.tipo, Number(r.cantidad)),
      monto_ars: applySign(v.tipo, sub),
      monto_usd: dolar > 0 ? applySign(v.tipo, sub / dolar) : 0,
      fecha: String(v.fecha),
      tipo: v.tipo,
      cliente_id: v.cliente_id == null ? null : Number(v.cliente_id),
      venta_neto_usd: Number(v.neto_usd),
    })
  }
  return out
}

const anioDe = (fecha: string) => Number(fecha.slice(0, 4))
const mesDe = (fecha: string) => Number(fecha.slice(5, 7))
const montoItem = (it: ItemResumen, moneda: Moneda) => (moneda === "usd" ? it.monto_usd : it.monto_ars)

export function filtrarItemsAnios(items: ItemResumen[], desde: number, hasta: number) {
  return items.filter((it) => {
    const y = anioDe(it.fecha)
    return y >= desde && y <= hasta
  })
}

// How much of the period's invoicing (U$S) has line detail, and since when detail is loaded.
export function cobertura(items: ItemResumen[], netoPeriodoUsd: number) {
  const ventas = new Map<number, number>()
  let desde: string | null = null
  for (const it of items) {
    ventas.set(it.venta_id, it.venta_neto_usd)
    if (!desde || it.fecha < desde) desde = it.fecha
  }
  const conDetalle = [...ventas.values()].reduce((a, b) => a + b, 0)
  return {
    ventas: ventas.size,
    share: netoPeriodoUsd > 0 ? conDetalle / netoPeriodoUsd : 0,
    desde,
  }
}

export interface ArticuloStats {
  clave: string
  referencia: string | null
  descripcion: string
  marca: string | null
  categoria: string | null
  total: number
  cantidad: number
  ventas: number // distinct sales that include it
  clientes: number // distinct identified clients
  share: number
  ultima: string
}

export function rankingArticulos(items: ItemResumen[], moneda: Moneda): ArticuloStats[] {
  const map = new Map<string, ArticuloStats & { _ventas: Set<number>; _clientes: Set<number> }>()
  let total = 0
  for (const it of items) {
    let a = map.get(it.clave)
    if (!a) {
      a = {
        clave: it.clave,
        referencia: it.referencia,
        descripcion: it.descripcion,
        marca: it.marca,
        categoria: it.categoria,
        total: 0,
        cantidad: 0,
        ventas: 0,
        clientes: 0,
        share: 0,
        ultima: it.fecha,
        _ventas: new Set(),
        _clientes: new Set(),
      }
      map.set(it.clave, a)
    }
    const m = montoItem(it, moneda)
    a.total += m
    a.cantidad += it.cantidad
    total += m
    if (it.tipo !== "NC") a._ventas.add(it.venta_id)
    if (it.cliente_id != null) a._clientes.add(it.cliente_id)
    if (it.fecha > a.ultima) a.ultima = it.fecha
  }
  return [...map.values()]
    .map(({ _ventas, _clientes, ...a }) => ({
      ...a,
      ventas: _ventas.size,
      clientes: _clientes.size,
      share: total ? a.total / total : 0,
    }))
    .sort((x, y) => y.total - x.total)
}

export interface GrupoStats {
  nombre: string
  total: number
  articulos: number
  share: number
}

// Totals by brand or category. Lines outside the catalog go to "Sin marca"/"Sin categoría".
export function rankingGrupo(items: ItemResumen[], moneda: Moneda, campo: "marca" | "categoria"): GrupoStats[] {
  const vacio = campo === "marca" ? "Sin marca" : "Sin categoría"
  const map = new Map<string, { total: number; claves: Set<string> }>()
  let total = 0
  for (const it of items) {
    const nombre = it[campo] ?? vacio
    let g = map.get(nombre)
    if (!g) map.set(nombre, (g = { total: 0, claves: new Set() }))
    const m = montoItem(it, moneda)
    g.total += m
    g.claves.add(it.clave)
    total += m
  }
  return [...map.entries()]
    .map(([nombre, g]) => ({ nombre, total: g.total, articulos: g.claves.size, share: total ? g.total / total : 0 }))
    .sort((a, b) => b.total - a.total)
}

// Same criterion as clients: sold in at least 2 different years and in at least 4 sales.
export function articuloTieneHistoria(items: ItemResumen[], clave: string) {
  const anios = new Set<number>()
  const ventas = new Set<number>()
  for (const it of items) {
    if (it.clave !== clave || it.tipo === "NC") continue
    anios.add(anioDe(it.fecha))
    ventas.add(it.venta_id)
  }
  return anios.size >= 2 && ventas.size >= 4
}

export function estacionalidadArticulo(items: ItemResumen[], clave: string): Estacionalidad {
  const porMes = new Array(12).fill(0)
  for (const it of items) if (it.clave === clave) porMes[mesDe(it.fecha) - 1] += it.monto_usd
  return estacionalidadDeMeses(porMes)
}
