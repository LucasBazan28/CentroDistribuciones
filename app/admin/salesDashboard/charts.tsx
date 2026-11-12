"use client"

import { ReactNode, useState } from "react"
import { Table2, BarChart3 } from "lucide-react"

// Chart chrome (light theme, matches the admin pages)
const INK_MUTED = "#898781"
const GRID = "#e1e0d9"
const BASELINE = "#c3c2b7"
export const SERIE = "#074BAD" // brand primary: single-series marks
const SERIE_HOVER = "#05398a"

// Sequential blue ramp (light -> dark) for heatmaps.
const RAMPA = [
  "#cde2fb", "#b7d3f6", "#9ec5f4", "#86b6ef", "#6da7ec", "#5598e7", "#3987e5",
  "#2a78d6", "#256abf", "#1c5cab", "#184f95", "#104281", "#0d366b",
]
const VACIO = "#f1f0ec"

export function colorSecuencial(t: number) {
  const i = Math.max(0, Math.min(RAMPA.length - 1, Math.round(t * (RAMPA.length - 1))))
  return { fondo: RAMPA[i], texto: i >= 7 ? "#ffffff" : "#0b0b0b" }
}

// ---------------------------------------------------------------- tooltip

interface TipState {
  x: number
  y: number
  content: ReactNode
}

export function useTooltip() {
  const [tip, setTip] = useState<TipState | null>(null)
  const show = (e: React.MouseEvent, content: ReactNode) => setTip({ x: e.clientX, y: e.clientY, content })
  const hide = () => setTip(null)
  const node = tip && (
    <div
      className="pointer-events-none fixed z-50 max-w-xs rounded-lg border border-black/10 bg-white px-3 py-2 text-xs text-gray-900 shadow-lg"
      style={{
        left: Math.min(tip.x + 14, (typeof window !== "undefined" ? window.innerWidth : 9999) - 240),
        top: tip.y + 14,
      }}
    >
      {tip.content}
    </div>
  )
  return { show, hide, node }
}

export function TipRow({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className={`tabular-nums ${strong ? "font-semibold text-gray-900" : "text-gray-700"}`}>{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------- card with chart / table toggle

export function ChartCard({
  title,
  subtitle,
  children,
  table,
  className = "",
}: {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  table?: ReactNode
  className?: string
}) {
  const [verTabla, setVerTabla] = useState(false)
  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {table && (
          <button
            type="button"
            onClick={() => setVerTabla((v) => !v)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            {verTabla ? <BarChart3 size={14} /> : <Table2 size={14} />}
            {verTabla ? "Ver gráfico" : "Ver tabla"}
          </button>
        )}
      </div>
      {verTabla && table ? <div className="max-h-96 overflow-auto">{table}</div> : children}
    </section>
  )
}

// ---------------------------------------------------------------- column chart

function niceStep(raw: number) {
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const f = raw / pow
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pow
}

function ticks(min: number, max: number, count = 4) {
  if (max === min) return [0, max || 1]
  const step = niceStep((max - min) / count)
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  const out: number[] = []
  for (let t = lo; t <= hi + step / 2; t += step) out.push(Math.round(t * 1e6) / 1e6)
  return out
}

export interface Columna {
  key: string
  label: string // x-axis label (may be empty to skip)
  value: number
  tooltip: ReactNode
  muted?: boolean // e.g. an incomplete year
  valueLabel?: string // direct label above the bar
}

export function ColumnChart({
  data,
  formatTick,
  height = 220,
}: {
  data: Columna[]
  formatTick: (n: number) => string
  height?: number
}) {
  const { show, hide, node } = useTooltip()
  const [hover, setHover] = useState<string | null>(null)
  const values = data.map((d) => d.value)
  const ts = ticks(Math.min(0, ...values), Math.max(0, ...values))
  const lo = ts[0]
  const hi = ts[ts.length - 1]
  const pct = (v: number) => ((v - lo) / (hi - lo)) * 100
  const zero = pct(0)
  const hasDirect = data.some((d) => d.valueLabel)

  return (
    <div className="flex gap-2">
      {/* y axis */}
      <div className="relative w-14 shrink-0 text-right text-[11px] tabular-nums" style={{ height, color: INK_MUTED }}>
        {ts.map((t) => (
          <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${pct(t)}%` }}>
            {formatTick(t)}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }}>
          {ts.map((t) => (
            <div
              key={t}
              className="absolute inset-x-0"
              style={{ bottom: `${pct(t)}%`, borderTop: `1px solid ${t === 0 ? BASELINE : GRID}` }}
            />
          ))}
          <div className="absolute inset-0 flex" onMouseLeave={() => { hide(); setHover(null) }}>
            {data.map((d) => {
              const top = d.value >= 0 ? 100 - pct(d.value) : 100 - zero
              const h = Math.abs(pct(d.value) - zero)
              const active = hover === d.key
              return (
                <div
                  key={d.key}
                  className="relative h-full flex-1 cursor-default"
                  style={{ paddingLeft: 1, paddingRight: 1 }}
                  onMouseMove={(e) => { setHover(d.key); show(e, d.tooltip) }}
                >
                  {hasDirect && d.valueLabel && (
                    <span
                      className="absolute inset-x-0 text-center text-[11px] font-medium tabular-nums text-gray-700"
                      style={{ top: `calc(${top}% - 16px)` }}
                    >
                      {d.valueLabel}
                    </span>
                  )}
                  <div
                    className={`absolute inset-x-[1px] ${d.value >= 0 ? "rounded-t" : "rounded-b"}`}
                    style={{
                      top: `${top}%`,
                      height: `${Math.max(h, d.value === 0 ? 0 : 0.5)}%`,
                      background: active ? SERIE_HOVER : SERIE,
                      opacity: d.muted && !active ? 0.45 : 1,
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
        {/* x axis */}
        <div className="mt-1.5 flex text-[11px]" style={{ color: INK_MUTED }}>
          {data.map((d) => (
            <span key={d.key} className="flex-1 overflow-visible whitespace-nowrap text-center">
              {d.label}
            </span>
          ))}
        </div>
      </div>
      {node}
    </div>
  )
}

// ---------------------------------------------------------------- heatmap

export interface FilaHeatmap {
  key: string
  label: ReactNode
  cells: (number | null)[] // value in [0, 1] relative to the color scale, null = no data
  text?: (string | null)[] // label inside each cell
  tooltips: ReactNode[]
  extra?: ReactNode // trailing column
}

export function Heatmap({
  columnas,
  filas,
  labelWidth = "7rem",
  extraHeader,
  extraWidth = "8rem",
}: {
  columnas: string[]
  filas: FilaHeatmap[]
  labelWidth?: string
  extraHeader?: string
  extraWidth?: string
}) {
  const { show, hide, node } = useTooltip()
  const template = `${labelWidth} repeat(${columnas.length}, minmax(2.25rem, 1fr))${extraHeader !== undefined ? ` ${extraWidth}` : ""}`
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[36rem] text-xs" onMouseLeave={hide}>
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: template }}>
          <div />
          {columnas.map((c) => (
            <div key={c} className="pb-1 text-center font-medium" style={{ color: INK_MUTED }}>
              {c}
            </div>
          ))}
          {extraHeader !== undefined && <div className="pb-1 pl-2 font-medium" style={{ color: INK_MUTED }}>{extraHeader}</div>}

          {filas.map((f) => (
            <FilaRender key={f.key} fila={f} show={show} hasExtra={extraHeader !== undefined} />
          ))}
        </div>
      </div>
      {node}
    </div>
  )
}

function FilaRender({
  fila,
  show,
  hasExtra,
}: {
  fila: FilaHeatmap
  show: (e: React.MouseEvent, c: ReactNode) => void
  hasExtra: boolean
}) {
  return (
    <>
      <div className="flex items-center truncate pr-2 font-medium text-gray-900">{fila.label}</div>
      {fila.cells.map((v, i) => {
        const c = v == null ? { fondo: VACIO, texto: INK_MUTED } : colorSecuencial(v)
        return (
          <div
            key={i}
            className="flex h-8 items-center justify-center rounded tabular-nums"
            style={{ background: c.fondo, color: c.texto }}
            onMouseMove={(e) => show(e, fila.tooltips[i])}
          >
            {fila.text?.[i] ?? ""}
          </div>
        )
      })}
      {hasExtra && <div className="flex items-center pl-2 text-gray-700">{fila.extra}</div>}
    </>
  )
}

export function HeatmapLegend({ min, max }: { min: string; max: string }) {
  return (
    <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: INK_MUTED }}>
      <span>{min}</span>
      <div className="flex h-2.5 w-40 overflow-hidden rounded">
        {RAMPA.map((c) => (
          <div key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>
      <span>{max}</span>
    </div>
  )
}
