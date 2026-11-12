"use client"

import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle, ChevronDown, ChevronRight, Download, Loader2, Plus, Trash2, UserPlus, X } from "lucide-react"
import BackToAdminButton from "@/app/components/BackToAdminButton"
import ClientForm from "@/app/components/ClientForm"
import SaleItemsEditor, { ItemForm, errorItems, itemsParaEnviar, totalesItems } from "./SaleItemsEditor"
import { useExchangeRate } from "@/app/lib/exchangeRateContext"
import {
  Cliente,
  TIPOS,
  TIPOS_REQUIEREN_CUIT,
  TIPOS_SIN_CLIENTE,
  TIPO_LABEL,
  TipoComprobante,
  Venta,
  applySign,
  tipoEnTexto,
  formatARS,
  formatCuit,
  formatFecha,
  formatUSD,
  onlyDigits,
  padComprobante,
  round2,
  todayISO,
} from "@/app/lib/sales"

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]
const ALICUOTAS = ["21", "10.5", "27", "0"]
const PRIMER_ANIO = 2020

// Factura B shows IVA included, so (as in the Excel) its IVA is not broken out by default.
const defaultAlicuota = (tipo: TipoComprobante) => (tipo === "B" ? "0" : "21")

const TIPO_ACTIVE_CLASS: Record<TipoComprobante, string> = {
  A: "bg-primary text-white",
  B: "bg-primary text-white",
  M: "bg-primary text-white",
  FC: "bg-primary text-white",
  NC: "bg-red-600 text-white",
  ND: "bg-amber-600 text-white",
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

// Accepts "1.234,56", "1234,56" or "1234.56".
function parseAmount(value: string) {
  const v = value.trim()
  if (!v) return NaN
  const normalized = v.includes(",") ? v.replace(/\./g, "").replace(",", ".") : v
  return Number(normalized)
}

const emptyForm = (tipo: TipoComprobante = "A") => ({
  tipo,
  nro_comprobante: "",
  fecha: todayISO(),
  neto: "",
  alicuota: defaultAlicuota(tipo),
  iva: "",
  dolar: "",
  observacion: "",
})

export default function ManageSalesClient() {
  const { dollarRate, error: rateError, loading: rateLoading } = useExchangeRate()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loadingVentas, setLoadingVentas] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const now = new Date()
  const [anio, setAnio] = useState(now.getFullYear())
  const [mes, setMes] = useState(now.getMonth() + 1)

  const [form, setForm] = useState(emptyForm)
  const [ivaTouched, setIvaTouched] = useState(false)
  const [items, setItems] = useState<ItemForm[]>([])
  const [expandida, setExpandida] = useState<number | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [consumidorFinal, setConsumidorFinal] = useState(false)
  const [clienteQuery, setClienteQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [creatingClient, setCreatingClient] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Load clients once
  useEffect(() => {
    fetch("/api/clientes")
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || "Error al cargar los clientes")
        setClientes(data)
      })
      .catch((err) => setError(err.message))
  }, [])

  // Prefill dollar rate (only when the real rate loaded, not the fallback)
  useEffect(() => {
    if (!rateLoading && !rateError && dollarRate && !form.dolar) {
      setForm((f) => ({ ...f, dolar: String(dollarRate) }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateLoading, rateError, dollarRate])

  const suggestNumber = useCallback(async (tipo: TipoComprobante) => {
    try {
      const r = await fetch(`/api/ventas?siguiente=${tipo}`)
      const data = await r.json()
      if (r.ok) setForm((f) => (f.tipo === tipo ? { ...f, nro_comprobante: data.siguiente } : f))
    } catch {
      // Leave the field empty; the user types it.
    }
  }, [])

  useEffect(() => {
    suggestNumber(form.tipo)
  }, [form.tipo, suggestNumber])

  const loadVentas = useCallback(async () => {
    setLoadingVentas(true)
    try {
      const r = await fetch(`/api/ventas?anio=${anio}&mes=${mes}`)
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || "Error al cargar las ventas")
      setVentas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las ventas")
    } finally {
      setLoadingVentas(false)
    }
  }, [anio, mes])

  useEffect(() => {
    loadVentas()
  }, [loadVentas])

  // Derived amounts (as they will be stored: NC in negative)
  // With line items, neto and IVA come from the lines (each line has its own rate).
  const conItems = items.length > 0
  const totItems = totalesItems(items)
  const netoInput = conItems ? totItems.neto : parseAmount(form.neto)
  const autoIva = conItems
    ? totItems.iva
    : Number.isFinite(netoInput)
      ? round2((netoInput * Number(form.alicuota)) / 100)
      : NaN
  const ivaInput = ivaTouched ? parseAmount(form.iva) : autoIva
  const neto = applySign(form.tipo, netoInput)
  const iva = applySign(form.tipo, ivaInput)
  const total = Number.isFinite(neto) && Number.isFinite(iva) ? round2(neto + iva) : NaN
  const dolar = parseAmount(form.dolar)
  const permiteSinCliente = TIPOS_SIN_CLIENTE.includes(form.tipo)
  const sinCliente = permiteSinCliente && consumidorFinal
  const requiereCuit = TIPOS_REQUIEREN_CUIT.includes(form.tipo)

  const suggestions = useMemo(() => {
    const q = clienteQuery.trim().toLowerCase()
    if (!q) return clientes.slice(0, 8)
    const qDigits = onlyDigits(q)
    return clientes
      .filter((c) => c.razon_social.toLowerCase().includes(q) || (qDigits && c.cuit?.includes(qDigits)))
      .slice(0, 8)
  }, [clientes, clienteQuery])

  const selectCliente = (c: Cliente) => {
    setCliente(c)
    setClienteQuery(c.razon_social)
    setShowSuggestions(false)
  }

  const changeTipo = (tipo: TipoComprobante) => {
    setForm((f) => ({ ...f, tipo, nro_comprobante: "", alicuota: defaultAlicuota(tipo) }))
    setIvaTouched(false)
    if (!TIPOS_SIN_CLIENTE.includes(tipo)) setConsumidorFinal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!sinCliente && !cliente) {
      return setError(
        permiteSinCliente
          ? "Seleccioná un cliente o marcá \"Consumidor final sin identificar\""
          : "Seleccioná un cliente (o registralo si es nuevo)"
      )
    }
    if (cliente && requiereCuit && !cliente.cuit) {
      return setError(`La ${tipoEnTexto(form.tipo)} requiere un cliente con CUIT. Editá el cliente o elegí otro tipo.`)
    }
    if (!padComprobante(form.nro_comprobante)) return setError("Ingresá el número de comprobante")
    const errItems = errorItems(items)
    if (errItems) return setError(errItems)
    if (!Number.isFinite(neto) || neto === 0) return setError("Ingresá un importe neto válido")
    if (!Number.isFinite(iva)) return setError("El IVA no es válido")
    if (!(dolar > 0)) return setError("Ingresá la cotización del dólar")

    const send = (permitir_duplicado: boolean) =>
      fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: form.tipo,
          nro_comprobante: form.nro_comprobante,
          fecha: form.fecha,
          cliente_id: sinCliente ? null : cliente!.id,
          neto_ars: neto,
          iva_ars: iva,
          dolar,
          observacion: form.observacion,
          items: itemsParaEnviar(items),
          permitir_duplicado,
        }),
      })

    setSaving(true)
    try {
      let r = await send(false)
      let data = await r.json()
      if (r.status === 409 && data.duplicado) {
        if (!confirm(`${data.error}.\n\n¿Registrar igual? (por ejemplo, si es de otro punto de venta)`)) return
        r = await send(true)
        data = await r.json()
      }
      if (!r.ok) throw new Error(data.error || "Error al registrar la venta")

      const [y, m] = form.fecha.split("-").map(Number)
      if (y === anio && (mes === 0 || m === mes)) {
        setVentas((prev) => [...prev, data].sort((a, b) => a.fecha.localeCompare(b.fecha)))
      }
      setSuccess(
        `${TIPO_LABEL[form.tipo]} ${data.nro_comprobante} registrada` +
          (cliente && !sinCliente ? ` para ${cliente.razon_social}` : " (consumidor final)")
      )

      // Keep type, date and dollar for the next entry
      setForm((f) => ({ ...emptyForm(f.tipo), fecha: f.fecha, dolar: f.dolar }))
      setIvaTouched(false)
      setItems([])
      setCliente(null)
      setClienteQuery("")
      suggestNumber(form.tipo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar la venta")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (v: Venta) => {
    if (!confirm(`¿Eliminar ${TIPO_LABEL[v.tipo]} ${v.nro_comprobante}?`)) return
    setDeletingId(v.id)
    try {
      const r = await fetch("/api/ventas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: v.id }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || "Error al eliminar")
      setVentas((prev) => prev.filter((x) => x.id !== v.id))
      setSuccess("Comprobante eliminado")
      suggestNumber(form.tipo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    } finally {
      setDeletingId(null)
    }
  }

  const totales = useMemo(() => {
    return ventas.reduce(
      (acc, v) => {
        acc.neto += v.neto_ars
        acc.iva += v.iva_ars
        acc.total += v.total_ars
        acc.netoUsd += v.neto_usd
        acc.ivaUsd += v.iva_usd
        acc.totalUsd += v.total_usd
        return acc
      },
      { neto: 0, iva: 0, total: 0, netoUsd: 0, ivaUsd: 0, totalUsd: 0 }
    )
  }, [ventas])

  // CSV with the same columns as the Excel sheet (opens directly in Excel)
  const exportCsv = () => {
    const num = (n: number) => n.toFixed(2).replace(".", ",")
    const header = [
      "TIPO FACT.", "N° FACT", "AÑO", "MES", "DÍA", "CUIT", "CLIENTE",
      "Facturación [$]", "IVA", "TOTAL", "Facturación [U$s]", "IVA [U$s]", "TOTAL [U$s]", "DÓLAR",
    ]
    const rows = ventas.map((v) => {
      const [y, m] = v.fecha.split("-")
      return [
        v.tipo,
        v.nro_comprobante,
        y,
        String(Number(m)),
        formatFecha(v.fecha),
        v.clientes?.cuit ?? "",
        `"${(v.clientes?.razon_social ?? "").replace(/"/g, '""')}"`,
        num(v.neto_ars),
        num(v.iva_ars),
        num(v.total_ars),
        num(v.neto_usd),
        num(v.iva_usd),
        num(v.total_usd),
        num(v.dolar),
      ]
    })
    const csv = "﻿" + [header, ...rows].map((r) => r.join(";")).join("\r\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const a = document.createElement("a")
    a.href = url
    a.download = mes ? `ventas-${anio}-${String(mes).padStart(2, "0")}.csv` : `ventas-${anio}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const years = Array.from({ length: now.getFullYear() - PRIMER_ANIO + 1 }, (_, i) => now.getFullYear() - i)
  const periodo = mes ? `${MESES[mes - 1].toLowerCase()} ${anio}` : String(anio)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <BackToAdminButton />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ventas</h1>
          <p className="text-gray-600">Registrá facturas, notas de crédito y notas de débito</p>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 rounded-lg bg-red-50 p-4 text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0 pt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 flex gap-3 rounded-lg bg-green-50 p-4 text-green-600">
            <CheckCircle className="h-5 w-5 flex-shrink-0 pt-0.5" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* Register sale */}
        <div className="mb-10 rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registrar venta</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de comprobante</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {TIPOS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => changeTipo(t)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                      form.tipo === t
                        ? `${TIPO_ACTIVE_CLASS[t]} border-transparent`
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-1.5 font-mono">{t}</span>
                    <span className="font-normal">{TIPO_LABEL[t]}</span>
                  </button>
                ))}
              </div>
              {form.tipo === "NC" && (
                <p className="mt-2 text-xs text-red-600">Ingresá los importes en positivo: la nota de crédito se registra restando.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° de comprobante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.nro_comprobante}
                  onChange={(e) => setForm({ ...form, nro_comprobante: onlyDigits(e.target.value).slice(0, 8) })}
                  onBlur={() => setForm((f) => ({ ...f, nro_comprobante: padComprobante(f.nro_comprobante) }))}
                  placeholder="00002778"
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Client picker */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cliente {!sinCliente && <span className="text-red-500">*</span>}
                </label>
                {permiteSinCliente && (
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={consumidorFinal}
                      onChange={(e) => {
                        setConsumidorFinal(e.target.checked)
                        setCreatingClient(false)
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Consumidor final sin identificar
                  </label>
                )}
              </div>
              {sinCliente ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  Se registra sin cliente (consumidor final).
                </div>
              ) : creatingClient ? (
                <div className="rounded-lg border border-primary/30 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Nuevo cliente</h3>
                    <button type="button" onClick={() => setCreatingClient(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={20} />
                    </button>
                  </div>
                  <ClientForm
                    initialRazonSocial={/\d{5,}/.test(clienteQuery) ? "" : clienteQuery}
                    onSaved={(c) => {
                      setClientes((prev) => [...prev, c].sort((a, b) => a.razon_social.localeCompare(b.razon_social)))
                      selectCliente(c)
                      setCreatingClient(false)
                    }}
                    onCancel={() => setCreatingClient(false)}
                  />
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={clienteQuery}
                      onChange={(e) => {
                        setClienteQuery(e.target.value)
                        setCliente(null)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Buscar por razón social o CUIT"
                      className={`${inputClass} ${cliente ? "border-green-500" : ""}`}
                    />
                    {cliente && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-500">
                        {cliente.cuit ? formatCuit(cliente.cuit) : "Sin CUIT"}
                      </span>
                    )}
                    {showSuggestions && !cliente && (
                      <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                        {suggestions.length === 0 ? (
                          <li className="px-4 py-3 text-sm text-gray-500">Sin resultados. Registrá el cliente con el botón de al lado.</li>
                        ) : (
                          suggestions.map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectCliente(c)}
                                className="flex w-full items-center justify-between gap-4 px-4 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <span className="font-medium text-gray-900">{c.razon_social}</span>
                                <span className="font-mono text-gray-500 whitespace-nowrap">
                                  {c.cuit ? formatCuit(c.cuit) : "Sin CUIT"}
                                </span>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                    {cliente && requiereCuit && !cliente.cuit && (
                      <p className="mt-1 text-xs text-red-600">
                        Este cliente no tiene CUIT: no se le puede emitir una {tipoEnTexto(form.tipo)}.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreatingClient(true)}
                    className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
                  >
                    <UserPlus size={18} />
                    Nuevo cliente
                  </button>
                </div>
              )}
            </div>

            <SaleItemsEditor
              items={items}
              onChange={(next) => {
                setItems(next)
                setIvaTouched(false)
              }}
              dolar={dolar}
            />

            {/* Amounts */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facturación neta [$] <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={conItems ? (Number.isFinite(netoInput) ? netoInput.toFixed(2).replace(".", ",") : "") : form.neto}
                  onChange={(e) => setForm({ ...form, neto: e.target.value })}
                  readOnly={conItems}
                  title={conItems ? "Suma de los renglones del detalle" : undefined}
                  placeholder="320592,89"
                  className={`${inputClass} ${conItems ? "bg-gray-50" : ""}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alícuota IVA</label>
                <select
                  value={conItems ? "" : form.alicuota}
                  disabled={conItems}
                  title={conItems ? "Con detalle, cada renglón tiene su alícuota" : undefined}
                  onChange={(e) => {
                    setForm({ ...form, alicuota: e.target.value })
                    setIvaTouched(false)
                  }}
                  className={inputClass}
                >
                  {conItems && <option value="">Por renglón</option>}
                  {ALICUOTAS.map((a) => (
                    <option key={a} value={a}>{a.replace(".", ",")}%</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IVA [$]</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={ivaTouched ? form.iva : Number.isFinite(autoIva) ? autoIva.toFixed(2).replace(".", ",") : ""}
                  onChange={(e) => {
                    setIvaTouched(true)
                    setForm({ ...form, iva: e.target.value })
                  }}
                  title="Se calcula solo; podés corregirlo si el comprobante tiene otro importe"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total [$]</label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-semibold text-gray-900">
                  {Number.isFinite(total) ? formatARS(total) : "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dólar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.dolar}
                  onChange={(e) => setForm({ ...form, dolar: e.target.value })}
                  placeholder="1550"
                  className={inputClass}
                />
              </div>
            </div>

            {Number.isFinite(total) && dolar > 0 && neto !== 0 && (
              <p className="text-sm text-gray-600">
                Equivale a <span className="font-semibold">{formatUSD(total / dolar)}</span>
                {" "}(neto {formatUSD(neto / dolar)} + IVA {formatUSD(iva / dolar)})
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observación</label>
              <input
                type="text"
                value={form.observacion}
                onChange={(e) => setForm({ ...form, observacion: e.target.value })}
                placeholder={form.tipo === "NC" ? "Ej: anula factura A 00002765" : "Opcional"}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 rounded-lg px-6 py-2 font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                form.tipo === "NC"
                  ? "bg-red-600 hover:bg-red-700"
                  : form.tipo === "ND"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              {saving ? "Guardando..." : `Registrar ${tipoEnTexto(form.tipo)}`}
            </button>
          </form>
        </div>

        {/* Sales sheet */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div className="flex gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
              <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className={inputClass}>
                <option value={0}>Todo el año</option>
                {MESES.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <select value={anio} onChange={(e) => setAnio(Number(e.target.value))} className={inputClass}>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={exportCsv}
            disabled={ventas.length === 0}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 font-semibold text-white hover:bg-gray-900 disabled:opacity-50"
          >
            <Download size={18} />
            Exportar a Excel (CSV)
          </button>
        </div>

        {loadingVentas ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Cargando...</span>
          </div>
        ) : ventas.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow">
            <p className="text-gray-500">No hay ventas registradas en {periodo}.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold">Tipo</th>
                    <th className="px-3 py-3 text-left font-semibold">N° Fact.</th>
                    <th className="px-3 py-3 text-left font-semibold">Día</th>
                    <th className="px-3 py-3 text-left font-semibold">CUIT</th>
                    <th className="px-3 py-3 text-left font-semibold">Cliente</th>
                    <th className="px-3 py-3 text-right font-semibold">Facturación [$]</th>
                    <th className="px-3 py-3 text-right font-semibold">IVA</th>
                    <th className="px-3 py-3 text-right font-semibold">Total</th>
                    <th className="px-3 py-3 text-right font-semibold">Fact. [U$s]</th>
                    <th className="px-3 py-3 text-right font-semibold">IVA [U$s]</th>
                    <th className="px-3 py-3 text-right font-semibold">Total [U$s]</th>
                    <th className="px-3 py-3 text-right font-semibold">Dólar</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v, idx) => {
                    const color = v.tipo === "NC" ? "text-red-600" : v.tipo === "ND" ? "text-amber-700" : "text-gray-900"
                    const vItems = v.ventas_items ?? []
                    const abierta = expandida === v.id
                    return (
                      <Fragment key={v.id}>
                      <tr
                        className={`border-b border-gray-200 ${color} ${idx % 2 ? "bg-slate-50" : "bg-white"}`}
                        title={v.observacion ?? undefined}
                      >
                        <td className="px-3 py-2 font-mono font-semibold" title={TIPO_LABEL[v.tipo]}>
                          {vItems.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setExpandida(abierta ? null : v.id)}
                              className="flex items-center gap-1"
                              title={`${vItems.length} artículo${vItems.length === 1 ? "" : "s"}`}
                            >
                              {abierta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              {v.tipo}
                              <span className="rounded bg-primary/10 px-1 text-[10px] font-semibold text-primary">{vItems.length}</span>
                            </button>
                          ) : (
                            <span className="pl-[18px]">{v.tipo}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono">{v.nro_comprobante}</td>
                        <td className="px-3 py-2">{formatFecha(v.fecha)}</td>
                        <td className="px-3 py-2 font-mono">{v.clientes?.cuit ?? ""}</td>
                        <td className="px-3 py-2 max-w-xs truncate">
                          {v.clientes?.razon_social ?? <span className="italic text-gray-400">Consumidor final</span>}
                        </td>
                        <td className="px-3 py-2 text-right">{formatARS(v.neto_ars)}</td>
                        <td className="px-3 py-2 text-right">{formatARS(v.iva_ars)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{formatARS(v.total_ars)}</td>
                        <td className="px-3 py-2 text-right">{formatUSD(v.neto_usd)}</td>
                        <td className="px-3 py-2 text-right">{formatUSD(v.iva_usd)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{formatUSD(v.total_usd)}</td>
                        <td className="px-3 py-2 text-right">{v.dolar}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => handleDelete(v)}
                            disabled={deletingId === v.id}
                            className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                            title="Eliminar"
                          >
                            {deletingId === v.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </td>
                      </tr>
                      {abierta && (
                        <tr className="border-b border-gray-200 bg-white">
                          <td />
                          <td colSpan={12} className="px-3 py-3">
                            <table className="text-xs text-gray-700">
                              <thead className="text-gray-500">
                                <tr>
                                  <th className="pr-6 text-left font-medium">Referencia</th>
                                  <th className="pr-6 text-left font-medium">Descripción</th>
                                  <th className="pr-6 text-right font-medium">Cant.</th>
                                  <th className="pr-6 text-right font-medium">Precio unit. neto</th>
                                  <th className="pr-6 text-right font-medium">IVA</th>
                                  <th className="text-right font-medium">Subtotal neto</th>
                                </tr>
                              </thead>
                              <tbody>
                                {vItems.map((it) => (
                                  <tr key={it.id}>
                                    <td className="pr-6 font-mono">{it.articulos?.referencia ?? "—"}</td>
                                    <td className="max-w-md truncate pr-6">{it.descripcion}</td>
                                    <td className="pr-6 text-right">{Number(it.cantidad).toLocaleString("es-AR")}</td>
                                    <td className="pr-6 text-right">{formatARS(it.precio_unitario_ars)}</td>
                                    <td className="pr-6 text-right">{String(it.alicuota_iva).replace(".", ",")}%</td>
                                    <td className="text-right">{formatARS(it.subtotal_ars)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-100 font-bold text-gray-900">
                  <tr>
                    <td className="px-3 py-3" colSpan={5}>
                      Total {periodo} ({ventas.length} comprobantes)
                    </td>
                    <td className="px-3 py-3 text-right">{formatARS(totales.neto)}</td>
                    <td className="px-3 py-3 text-right">{formatARS(totales.iva)}</td>
                    <td className="px-3 py-3 text-right">{formatARS(totales.total)}</td>
                    <td className="px-3 py-3 text-right">{formatUSD(totales.netoUsd)}</td>
                    <td className="px-3 py-3 text-right">{formatUSD(totales.ivaUsd)}</td>
                    <td className="px-3 py-3 text-right">{formatUSD(totales.totalUsd)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
