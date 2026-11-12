"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Info, Loader2, TrendingDown, TrendingUp } from "lucide-react"
import BackToAdminButton from "@/app/components/BackToAdminButton"
import { formatCuit, formatFecha } from "@/app/lib/sales"
import {
  ClienteResumen,
  MESES_CORTOS,
  Moneda,
  TipoEstacionalidad,
  VentaResumen,
  aniosConVentas,
  altasYBajas,
  clientesInactivos,
  clientesParaPorcentaje,
  estacionalidadCliente,
  etiquetaVentana,
  filtrarAnios,
  fmtCompacto,
  fmtMonto,
  fmtNumero,
  fmtPct,
  indiceMensual,
  interanual,
  kpis,
  matrizEstacional,
  normalizar,
  rangoFechas,
  rankingClientes,
  serieMensual,
  tieneHistoria,
  totalesAnuales,
} from "@/app/lib/salesStats"
import { ChartCard, ColumnChart, Heatmap, HeatmapLegend, SERIE, TipRow } from "./charts"

const selectClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

const ESTACION_LABEL: Record<TipoEstacionalidad, string> = {
  fin: "Fin de año",
  mitad: "Mitad de año",
  otro: "Otro período",
  parejo: "Parejo",
}

type FiltroEstacion = "todos" | "estacionales" | "fin" | "mitad"

export default function SalesDashboardClient() {
  const [ventas, setVentas] = useState<VentaResumen[]>([])
  const [clientes, setClientes] = useState<Map<number, ClienteResumen>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [desde, setDesde] = useState(0)
  const [hasta, setHasta] = useState(0)
  const [moneda, setMoneda] = useState<Moneda>("usd")
  const [topN, setTopN] = useState(15)
  const [filtroEstacion, setFiltroEstacion] = useState<FiltroEstacion>("todos")

  useEffect(() => {
    fetch("/api/ventas/dashboard")
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || "Error al cargar las ventas")
        const vs = normalizar(data.ventas)
        setVentas(vs)
        setClientes(new Map((data.clientes as ClienteResumen[]).map((c) => [c.id, c])))
        const anios = aniosConVentas(vs)
        if (anios.length) {
          setDesde(anios[0])
          setHasta(anios[anios.length - 1])
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar las ventas"))
      .finally(() => setLoading(false))
  }, [])

  const anios = useMemo(() => aniosConVentas(ventas), [ventas])
  const { min: primera, max: ultima } = useMemo(() => rangoFechas(ventas), [ventas])
  const periodo = useMemo(() => filtrarAnios(ventas, desde, hasta), [ventas, desde, hasta])

  const k = useMemo(() => kpis(periodo, moneda), [periodo, moneda])
  const yoy = useMemo(() => interanual(ventas, hasta, moneda), [ventas, hasta, moneda])
  const mensual = useMemo(() => serieMensual(periodo, moneda, desde, hasta, ultima), [periodo, moneda, desde, hasta, ultima])
  const anuales = useMemo(() => totalesAnuales(periodo, moneda, desde, hasta), [periodo, moneda, desde, hasta])
  const matriz = useMemo(() => matrizEstacional(periodo, desde, hasta, primera, ultima), [periodo, desde, hasta, primera, ultima])
  const mensualUsd = useMemo(() => serieMensual(periodo, "usd", desde, hasta, ultima), [periodo, desde, hasta, ultima])
  const { indice, anios: aniosIndice } = useMemo(() => indiceMensual(matriz), [matriz])
  const ranking = useMemo(
    () => rankingClientes(periodo, clientes, moneda, yoy ? { anio: yoy.anio, mesHasta: yoy.mesHasta } : null),
    [periodo, clientes, moneda, yoy]
  )
  const altas = useMemo(
    () => altasYBajas(ventas, primera, ultima).filter((a) => a.anio >= desde && a.anio <= hasta),
    [ventas, primera, ultima, desde, hasta]
  )
  const inactivos = useMemo(() => clientesInactivos(ventas, clientes, ultima), [ventas, clientes, ultima])

  const estacionales = useMemo(() => {
    const elegibles = ranking.ranking.filter((c) => tieneHistoria(periodo, c.id)).slice(0, 25)
    return elegibles.map((c) => ({ cliente: c, est: estacionalidadCliente(periodo, c.id) }))
  }, [ranking, periodo])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Cargando ventas...</span>
      </div>
    )
  }

  const mesLabel = (m: number) => MESES_CORTOS[m - 1]
  const muchosMeses = mensual.length > 24
  const top10 = ranking.ranking.slice(0, 10).reduce((a, c) => a + c.share, 0)
  const para80 = clientesParaPorcentaje(ranking.ranking, 0.8)
  const maxShareAnual = Math.max(0.0001, ...matriz.flatMap((f) => f.shares.map((s) => s ?? 0)))
  const estacionalesFiltrados = estacionales.filter(({ est }) =>
    filtroEstacion === "todos" ? true : filtroEstacion === "estacionales" ? est.tipo !== "parejo" : est.tipo === filtroEstacion
  )
  const maxTotal = Math.max(...ranking.ranking.slice(0, topN).map((c) => c.total), 1)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <BackToAdminButton />
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Dashboard de ventas</h1>
          <p className="text-gray-600">
            Facturación neta (sin IVA); las notas de crédito restan.
            {ventas.length > 0 && ` Datos del ${formatFecha(primera)} al ${formatFecha(ultima)}.`}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 rounded-lg bg-red-50 p-4 text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0 pt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {ventas.length === 0 ? (
          !error && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500 shadow">
              Todavía no hay ventas registradas.
            </div>
          )
        ) : (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Desde</label>
                <select value={desde} onChange={(e) => { const v = Number(e.target.value); setDesde(v); if (v > hasta) setHasta(v) }} className={selectClass}>
                  {anios.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Hasta</label>
                <select value={hasta} onChange={(e) => { const v = Number(e.target.value); setHasta(v); if (v < desde) setDesde(v) }} className={selectClass}>
                  {anios.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Moneda</label>
                <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white">
                  {(["usd", "ars"] as Moneda[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMoneda(m)}
                      className={`px-4 py-2 text-sm font-semibold ${moneda === m ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      {m === "usd" ? "U$S" : "$"}
                    </button>
                  ))}
                </div>
              </div>
              {moneda === "ars" && (
                <p className="flex items-center gap-1.5 pb-2 text-xs text-gray-500">
                  <Info size={14} /> Los pesos no están ajustados por inflación: para comparar años conviene U$S.
                </p>
              )}
            </div>

            {/* KPIs */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <Kpi label="Facturación neta" value={fmtCompacto(k.neto, moneda)} sub={`${desde === hasta ? desde : `${desde}–${hasta}`}`} />
              <Kpi
                label={yoy ? `${yoy.anio} vs ${yoy.anio - 1}` : "Variación interanual"}
                value={yoy ? <Delta value={yoy.variacion} /> : "—"}
                sub={yoy ? (yoy.mesHasta === 12 ? "Año completo" : `Mismos meses (ene–${MESES_CORTOS[yoy.mesHasta - 1].toLowerCase()})`) : "Sin año anterior para comparar"}
              />
              <Kpi label="Facturas emitidas" value={fmtNumero(k.facturas)} sub={`Ticket promedio ${fmtCompacto(k.ticket, moneda)}`} />
              <Kpi label="Clientes con compras" value={fmtNumero(k.clientesActivos)} sub={`El top 10 concentra ${fmtPct(top10, 0)}`} />
              <Kpi label="Notas de crédito" value={fmtPct(k.ncPct)} sub={`${fmtCompacto(k.notasCredito, moneda)} sobre lo facturado`} />
            </div>

            {/* Monthly evolution */}
            <ChartCard
              className="mb-6"
              title="Evolución mensual"
              subtitle={`Facturación neta por mes en ${moneda === "usd" ? "dólares" : "pesos"}`}
              table={
                <SimpleTable
                  head={["Mes", "Facturación", "Comprobantes"]}
                  rows={mensual.map((p) => [`${mesLabel(p.mes)} ${p.anio}`, fmtMonto(p.valor, moneda), fmtNumero(p.comprobantes)])}
                />
              }
            >
              <ColumnChart
                data={mensual.map((p) => ({
                  key: `${p.anio}-${p.mes}`,
                  label: muchosMeses ? (p.mes === 1 ? String(p.anio) : "") : `${mesLabel(p.mes)}${p.mes === 1 || mensual.length <= 12 ? ` ${String(p.anio).slice(2)}` : ""}`,
                  value: p.valor,
                  tooltip: (
                    <>
                      <p className="mb-1 font-semibold">{mesLabel(p.mes)} {p.anio}</p>
                      <TipRow label="Facturación" value={fmtMonto(p.valor, moneda)} strong />
                      <TipRow label="Comprobantes" value={fmtNumero(p.comprobantes)} />
                    </>
                  ),
                }))}
                formatTick={(n) => fmtCompacto(n, moneda).replace(/^U\$S |^\$ /, "")}
              />
            </ChartCard>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard
                title="Facturación por año"
                subtitle="Las barras claras son años incompletos"
                table={
                  <SimpleTable
                    head={["Año", "Facturación", "Facturas", "Meses con ventas"]}
                    rows={anuales.map((a) => [String(a.anio), fmtMonto(a.valor, moneda), fmtNumero(a.facturas), String(a.meses)])}
                  />
                }
              >
                <ColumnChart
                  data={anuales.map((a) => ({
                    key: String(a.anio),
                    label: String(a.anio),
                    value: a.valor,
                    muted: a.meses < 12,
                    valueLabel: fmtCompacto(a.valor, moneda).replace(/^U\$S |^\$ /, ""),
                    tooltip: (
                      <>
                        <p className="mb-1 font-semibold">{a.anio}{a.meses < 12 ? ` (${a.meses} meses con ventas)` : ""}</p>
                        <TipRow label="Facturación" value={fmtMonto(a.valor, moneda)} strong />
                        <TipRow label="Facturas" value={fmtNumero(a.facturas)} />
                      </>
                    ),
                  }))}
                  formatTick={(n) => fmtCompacto(n, moneda).replace(/^U\$S |^\$ /, "")}
                />
              </ChartCard>

              <ChartCard title="Clientes por año" subtitle="Nuevos = primera compra de su historia; perdidos = compraron el año anterior y no ese año">
                <SimpleTable
                  head={["Año", "Con compras", "Nuevos", "Recurrentes", "Perdidos"]}
                  rows={altas.map((a) => [String(a.anio), fmtNumero(a.activos), fmtNumero(a.nuevos), fmtNumero(a.recurrentes), a.perdidos == null ? "—" : fmtNumero(a.perdidos)])}
                />
              </ChartCard>
            </div>

            {/* Business seasonality */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
              <ChartCard
                className="lg:col-span-2"
                title="Mes típico"
                subtitle={
                  indice
                    ? `Índice de ventas por mes (100 = mes promedio), en U$S, promedio de ${aniosIndice.length === 1 ? aniosIndice[0] : `${aniosIndice[0]}–${aniosIndice[aniosIndice.length - 1]}`}`
                    : "Se necesita al menos un año completo en el rango elegido"
                }
                table={
                  indice && (
                    <SimpleTable head={["Mes", "Índice"]} rows={indice.map((v, i) => [MESES_CORTOS[i], fmtNumero(v)])} />
                  )
                }
              >
                {indice ? (
                  <ColumnChart
                    height={200}
                    data={indice.map((v, i) => ({
                      key: String(i),
                      label: MESES_CORTOS[i],
                      value: v,
                      tooltip: (
                        <>
                          <p className="mb-1 font-semibold">{MESES_CORTOS[i]}</p>
                          <TipRow label="Índice" value={fmtNumero(v)} strong />
                          <p className="mt-1 text-gray-500">
                            {v >= 100 ? `${fmtNumero(v - 100)}% por encima` : `${fmtNumero(100 - v)}% por debajo`} de un mes promedio
                          </p>
                        </>
                      ),
                    }))}
                    formatTick={(n) => fmtNumero(n)}
                  />
                ) : (
                  <p className="py-12 text-center text-sm text-gray-500">Sin años completos en el rango.</p>
                )}
              </ChartCard>

              <ChartCard
                className="lg:col-span-3"
                title="Peso de cada mes en el año"
                subtitle="Qué parte de la facturación anual (U$S) cayó en cada mes"
              >
                <Heatmap
                  labelWidth="3.5rem"
                  columnas={MESES_CORTOS}
                  filas={matriz.map((f) => ({
                    key: String(f.anio),
                    label: f.anio,
                    cells: f.shares.map((s) => (s == null ? null : s / maxShareAnual)),
                    text: f.shares.map((s) => (s == null ? "" : fmtPct(s, 0))),
                    tooltips: f.shares.map((s, i) => {
                      const p = mensualUsd.find((m) => m.anio === f.anio && m.mes === i + 1)
                      return s == null ? (
                        <span>Sin datos todavía</span>
                      ) : (
                        <>
                          <p className="mb-1 font-semibold">{MESES_CORTOS[i]} {f.anio}</p>
                          <TipRow label="Facturación" value={fmtMonto(p?.valor ?? 0, "usd")} strong />
                          <TipRow label="Del total del año" value={fmtPct(s)} />
                        </>
                      )
                    }),
                  }))}
                />
                <HeatmapLegend min="0%" max={fmtPct(maxShareAnual, 0)} />
              </ChartCard>
            </div>

            {/* Top clients */}
            <ChartCard
              className="mb-6"
              title="Clientes que más compran"
              subtitle={
                <>
                  {para80} {para80 === 1 ? "cliente explica" : "clientes explican"} el 80% de la facturación del período.
                  {ranking.consumidorFinal !== 0 && ` Consumidor final sin identificar: ${fmtMonto(ranking.consumidorFinal, moneda)}.`}
                </>
              }
            >
              <div className="mb-3 flex items-center gap-2 text-sm">
                <span className="text-gray-600">Mostrar</span>
                {[15, 50, 0].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTopN(n || ranking.ranking.length)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                      topN === (n || ranking.ranking.length) ? "border-primary bg-primary text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {n ? `Top ${n}` : `Todos (${ranking.ranking.length})`}
                  </button>
                ))}
              </div>
              <div className="max-h-[36rem] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white text-left text-xs text-gray-500">
                    <tr className="border-b border-gray-200">
                      <th className="py-2 pr-2 font-medium">#</th>
                      <th className="py-2 pr-4 font-medium">Cliente</th>
                      <th className="w-1/4 py-2 pr-4 font-medium">Facturación</th>
                      <th className="py-2 pr-4 text-right font-medium">% del total</th>
                      <th className="py-2 pr-4 text-right font-medium">% acum.</th>
                      <th className="py-2 pr-4 text-right font-medium">Facturas</th>
                      <th className="py-2 pr-4 text-right font-medium">Última compra</th>
                      <th className="py-2 text-right font-medium">{yoy ? `${yoy.anio} vs ${yoy.anio - 1}` : "Tendencia"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.ranking.slice(0, topN).map((c, i) => (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-slate-50">
                        <td className="py-2 pr-2 tabular-nums text-gray-400">{i + 1}</td>
                        <td className="max-w-xs py-2 pr-4">
                          <p className="truncate font-medium text-gray-900" title={c.nombre}>{c.nombre}</p>
                          {c.cuit && <p className="font-mono text-xs text-gray-400">{formatCuit(c.cuit)}</p>}
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3 flex-1 overflow-hidden rounded-sm bg-gray-100">
                              <div className="h-full rounded-r" style={{ width: `${Math.max(0, (c.total / maxTotal) * 100)}%`, background: SERIE }} />
                            </div>
                            <span className="w-24 text-right tabular-nums text-gray-900">{fmtCompacto(c.total, moneda)}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums">{fmtPct(c.share)}</td>
                        <td className="py-2 pr-4 text-right tabular-nums text-gray-500">{fmtPct(c.acumulado, 0)}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">{fmtNumero(c.facturas)}</td>
                        <td className="py-2 pr-4 text-right tabular-nums text-gray-600">{formatFecha(c.ultima)}</td>
                        <td className="py-2 text-right">
                          {c.anterior > 0 ? <Delta value={c.actual / c.anterior - 1} small /> : c.actual > 0 ? <span className="text-xs text-gray-500">Nuevo</span> : <span className="text-xs text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>

            {/* Client seasonality */}
            <ChartCard
              className="mb-6"
              title="Cuándo compra cada cliente"
              subtitle="Reparto de las compras de cada cliente por mes del año (U$S, todos los años del rango). Es estacional si 3 meses seguidos concentran la mitad o más. Se muestran los 25 principales con al menos 4 facturas en 2 años distintos."
            >
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                {(
                  [
                    ["todos", "Todos"],
                    ["estacionales", "Solo estacionales"],
                    ["fin", "Fin de año"],
                    ["mitad", "Mitad de año"],
                  ] as [FiltroEstacion, string][]
                ).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFiltroEstacion(v)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                      filtroEstacion === v ? "border-primary bg-primary text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {l} ({estacionales.filter(({ est }) => (v === "todos" ? true : v === "estacionales" ? est.tipo !== "parejo" : est.tipo === v)).length})
                  </button>
                ))}
              </div>
              {estacionalesFiltrados.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">Ningún cliente en esta categoría.</p>
              ) : (
                <>
                  <Heatmap
                    labelWidth="14rem"
                    columnas={MESES_CORTOS}
                    extraHeader="Patrón"
                    extraWidth="10rem"
                    filas={estacionalesFiltrados.map(({ cliente, est }) => {
                      const max = Math.max(...est.shares, 0.0001)
                      return {
                        key: String(cliente.id),
                        label: <span title={cliente.nombre} className="truncate">{cliente.nombre}</span>,
                        cells: est.shares.map((s) => s / max),
                        text: est.shares.map((s) => (s >= 0.05 ? fmtPct(s, 0) : "")),
                        tooltips: est.shares.map((s, i) => (
                          <>
                            <p className="mb-1 font-semibold">{cliente.nombre}</p>
                            <TipRow label={`Compras en ${MESES_CORTOS[i].toLowerCase()}`} value={fmtPct(s)} strong />
                          </>
                        )),
                        extra:
                          est.tipo === "parejo" ? (
                            <span className="text-xs text-gray-500">Parejo</span>
                          ) : (
                            <span className="text-xs">
                              <span className="font-semibold text-gray-900">{ESTACION_LABEL[est.tipo]}</span>
                              <span className="text-gray-500"> · {etiquetaVentana(est.ventana.desde)} {fmtPct(est.ventana.share, 0)}</span>
                            </span>
                          ),
                      }
                    })}
                  />
                  <HeatmapLegend min="Mes con menos compras" max="Mes con más compras" />
                </>
              )}
            </ChartCard>

            {/* Inactive clients */}
            <ChartCard
              title="Clientes a recuperar"
              subtitle={`Los que más compraron históricamente (U$S) y no compran desde hace más de 12 meses (antes del ${formatFecha(
                (() => {
                  const d = new Date(`${ultima}T00:00:00`)
                  d.setMonth(d.getMonth() - 12)
                  return d.toISOString().slice(0, 10)
                })()
              )})`}
            >
              {inactivos.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No hay clientes inactivos relevantes.</p>
              ) : (
                <SimpleTable
                  head={["Cliente", "CUIT", "Compras históricas", "Facturas", "Última compra"]}
                  rows={inactivos.map((c) => [c.nombre, c.cuit ? formatCuit(c.cuit) : "—", fmtMonto(c.total, "usd"), fmtNumero(c.facturas), formatFecha(c.ultima)])}
                />
              )}
            </ChartCard>
          </>
        )}
      </div>
    </div>
  )
}

function Kpi({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

function Delta({ value, small }: { value: number; small?: boolean }) {
  const up = value >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 tabular-nums ${small ? "text-xs font-medium" : ""} ${up ? "text-[#006300]" : "text-[#d03b3b]"}`}>
      <Icon size={small ? 14 : 20} />
      {up ? "+" : ""}
      {fmtPct(value, 0)}
    </span>
  )
}

function SimpleTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-white text-left text-xs text-gray-500">
        <tr className="border-b border-gray-200">
          {head.map((h, i) => (
            <th key={h} className={`py-2 pr-4 font-medium ${i > 0 ? "text-right" : ""}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-gray-100">
            {r.map((c, j) => (
              <td key={j} className={`py-1.5 pr-4 ${j > 0 ? "text-right tabular-nums" : "text-gray-900"}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
