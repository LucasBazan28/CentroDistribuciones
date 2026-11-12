"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, PackagePlus, Plus, Search, Trash2 } from "lucide-react"
import { formatARS, round2 } from "@/app/lib/sales"

// Line being edited: numeric fields stay as text while typing.
export interface ItemForm {
  key: string
  articulo_id: number | null
  referencia: string | null
  descripcion: string
  cantidad: string
  precio: string // unit price in ARS, net of IVA
  alicuota: string
}

interface ArticuloBusqueda {
  id: number
  referencia: string
  descripcion: string
  precio_venta: number | null // includes IVA, in the article's currency
  moneda_id: number // 1 = ARS, 2 = USD
  iva: number | null
  activo: boolean
  marcas: { nombre: string } | null
}

const MONEDA_USD = 2
const ALICUOTAS = ["21", "10.5", "27", "0"]

const cellInput =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

// Accepts "1.234,56", "1234,56" or "1234.56".
export function parseNumero(value: string) {
  const v = value.trim()
  if (!v) return NaN
  return Number(v.includes(",") ? v.replace(/\./g, "").replace(",", ".") : v)
}

export function subtotalItem(it: ItemForm) {
  const c = parseNumero(it.cantidad)
  const p = parseNumero(it.precio)
  return Number.isFinite(c) && Number.isFinite(p) ? round2(c * p) : NaN
}

export function totalesItems(items: ItemForm[]) {
  let neto = 0
  let iva = 0
  for (const it of items) {
    const s = subtotalItem(it)
    if (!Number.isFinite(s)) return { neto: NaN, iva: NaN }
    neto += s
    iva += s * (Number(it.alicuota) / 100)
  }
  return { neto: round2(neto), iva: round2(iva) }
}

// Validation message for the first invalid line, or "" when all are valid.
export function errorItems(items: ItemForm[]) {
  for (const [i, it] of items.entries()) {
    if (!it.descripcion.trim()) return `Renglón ${i + 1}: falta la descripción`
    if (!(parseNumero(it.cantidad) > 0)) return `Renglón ${i + 1}: la cantidad debe ser mayor a 0`
    if (!(parseNumero(it.precio) >= 0)) return `Renglón ${i + 1}: el precio no es válido`
  }
  return ""
}

export function itemsParaEnviar(items: ItemForm[]) {
  return items.map((it) => ({
    articulo_id: it.articulo_id,
    descripcion: it.descripcion.trim(),
    cantidad: parseNumero(it.cantidad),
    precio_unitario_ars: parseNumero(it.precio),
    alicuota_iva: Number(it.alicuota),
  }))
}

const nuevaKey = () => Math.random().toString(36).slice(2)
const fmtInput = (n: number) => n.toFixed(2).replace(".", ",")

export default function SaleItemsEditor({
  items,
  onChange,
  dolar,
}: {
  items: ItemForm[]
  onChange: (items: ItemForm[]) => void
  dolar: number // used to convert USD catalog prices
}) {
  const [query, setQuery] = useState("")
  const [resultados, setResultados] = useState<ArticuloBusqueda[]>([])
  const [buscando, setBuscando] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const pedido = useRef(0)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResultados([])
      return
    }
    const id = ++pedido.current
    const t = setTimeout(async () => {
      setBuscando(true)
      try {
        const r = await fetch(`/api/articulos/buscar?q=${encodeURIComponent(q)}`)
        const data = await r.json()
        if (id === pedido.current) setResultados(r.ok ? data : [])
      } finally {
        if (id === pedido.current) setBuscando(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const update = (key: string, patch: Partial<ItemForm>) =>
    onChange(items.map((it) => (it.key === key ? { ...it, ...patch } : it)))

  const agregarArticulo = (a: ArticuloBusqueda) => {
    const iva = a.iva ?? 21
    // Catalog price includes IVA and may be in USD: suggest the net unit price in ARS.
    let precio = ""
    if (a.precio_venta != null) {
      const neto = a.precio_venta / (1 + iva / 100)
      const enPesos = a.moneda_id === MONEDA_USD ? (dolar > 0 ? neto * dolar : NaN) : neto
      if (Number.isFinite(enPesos)) precio = fmtInput(enPesos)
    }
    onChange([
      ...items,
      {
        key: nuevaKey(),
        articulo_id: a.id,
        referencia: a.referencia,
        descripcion: a.descripcion,
        cantidad: "1",
        precio,
        alicuota: ALICUOTAS.includes(String(iva)) ? String(iva) : "21",
      },
    ])
    setQuery("")
    setAbierto(false)
  }

  const agregarLibre = () =>
    onChange([
      ...items,
      { key: nuevaKey(), articulo_id: null, referencia: null, descripcion: "", cantidad: "1", precio: "", alicuota: "21" },
    ])

  return (
    <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">Detalle de artículos</h3>
        <p className="text-xs text-gray-500">
          {items.length
            ? "El neto y el IVA se calculan con los renglones."
            : "Opcional, pero necesario para el análisis por artículo del dashboard."}
        </p>
      </div>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setAbierto(true)
            }}
            onFocus={() => setAbierto(true)}
            onBlur={() => setTimeout(() => setAbierto(false), 150)}
            placeholder="Buscar artículo por referencia o descripción"
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {buscando && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />}
          {abierto && query.trim().length >= 2 && !buscando && (
            <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {resultados.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-500">Sin resultados. Podés agregar un renglón libre.</li>
              ) : (
                resultados.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => agregarArticulo(a)}
                      className="flex w-full items-start justify-between gap-4 px-4 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span>
                        <span className="font-mono text-xs text-gray-500">{a.referencia}</span>
                        {a.marcas?.nombre && <span className="ml-2 text-xs text-gray-400">{a.marcas.nombre}</span>}
                        {!a.activo && <span className="ml-2 rounded bg-gray-100 px-1 text-xs text-gray-500">inactivo</span>}
                        <span className="block text-gray-900">{a.descripcion}</span>
                      </span>
                      {a.precio_venta != null && (
                        <span className="whitespace-nowrap text-xs text-gray-500">
                          {a.moneda_id === MONEDA_USD ? "U$S" : "$"} {a.precio_venta.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={agregarLibre}
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus size={16} />
          Renglón libre
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-3 text-sm text-gray-500">
          <PackagePlus size={18} />
          Sin renglones: se usa el importe neto que cargues abajo.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="text-left text-xs text-gray-500">
              <tr>
                <th className="pb-1 pr-2 font-medium">Artículo</th>
                <th className="w-24 pb-1 pr-2 font-medium">Cantidad</th>
                <th className="w-36 pb-1 pr-2 font-medium">Precio unit. neto [$]</th>
                <th className="w-24 pb-1 pr-2 font-medium">IVA</th>
                <th className="w-32 pb-1 pr-2 text-right font-medium">Subtotal neto</th>
                <th className="w-8 pb-1" />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const sub = subtotalItem(it)
                return (
                  <tr key={it.key} className="align-top">
                    <td className="py-1 pr-2">
                      {it.referencia && <p className="mb-0.5 font-mono text-xs text-gray-500">{it.referencia}</p>}
                      <input
                        type="text"
                        value={it.descripcion}
                        onChange={(e) => update(it.key, { descripcion: e.target.value })}
                        placeholder="Descripción"
                        className={cellInput}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={it.cantidad}
                        onChange={(e) => update(it.key, { cantidad: e.target.value })}
                        className={`${cellInput} text-right`}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={it.precio}
                        onChange={(e) => update(it.key, { precio: e.target.value })}
                        placeholder={dolar > 0 ? "" : "Cargá el dólar"}
                        className={`${cellInput} text-right`}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <select value={it.alicuota} onChange={(e) => update(it.key, { alicuota: e.target.value })} className={cellInput}>
                        {ALICUOTAS.map((a) => (
                          <option key={a} value={a}>{a.replace(".", ",")}%</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1 pr-2 pt-2.5 text-right tabular-nums text-gray-900">
                      {Number.isFinite(sub) ? formatARS(sub) : "—"}
                    </td>
                    <td className="py-1 pt-2">
                      <button
                        type="button"
                        onClick={() => onChange(items.filter((x) => x.key !== it.key))}
                        className="text-gray-400 hover:text-red-600"
                        title="Quitar renglón"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
