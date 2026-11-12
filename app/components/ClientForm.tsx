"use client"

import { useState } from "react"
import { Loader2, Save, X } from "lucide-react"
import { Cliente, isValidCuit, onlyDigits } from "@/app/lib/sales"

interface ClientFormProps {
  initial?: Cliente | null
  initialRazonSocial?: string
  onSaved: (cliente: Cliente) => void
  onCancel: () => void
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

export default function ClientForm({ initial, initialRazonSocial, onSaved, onCancel }: ClientFormProps) {
  const [form, setForm] = useState({
    cuit: initial?.cuit ?? "",
    razon_social: initial?.razon_social ?? initialRazonSocial ?? "",
    email: initial?.email ?? "",
    telefono: initial?.telefono ?? "",
    direccion: initial?.direccion ?? "",
  })
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const cuitDigits = onlyDigits(form.cuit)
  const cuitInvalid = cuitDigits.length === 11 && !isValidCuit(cuitDigits)

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.razon_social.trim()) return setError("La razón social es obligatoria")
    if (cuitDigits && !isValidCuit(cuitDigits)) return setError("El CUIT no es válido")

    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/clientes", {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cuit: cuitDigits, id: initial?.id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error al guardar el cliente")
      onSaved(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el cliente")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CUIT / CUIL</label>
          <input
            type="text"
            inputMode="numeric"
            value={form.cuit}
            onChange={set("cuit")}
            placeholder="30710589549"
            maxLength={13}
            className={`${inputClass} ${cuitInvalid ? "border-red-400" : ""}`}
            autoFocus={!initialRazonSocial}
          />
          {cuitInvalid ? (
            <p className="mt-1 text-xs text-red-600">El dígito verificador no coincide</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Dejalo vacío solo para consumidores finales sin CUIT (no podrán recibir facturas A, M o de crédito).
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Razón social <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.razon_social}
            onChange={set("razon_social")}
            placeholder="HP CONSTRUCCIONES SOCIEDAD ANONIMA"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" value={form.email} onChange={set("email")} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input type="text" value={form.telefono} onChange={set("telefono")} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
          <input type="text" value={form.direccion} onChange={set("direccion")} className={inputClass} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {saving ? "Guardando..." : "Guardar cliente"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
          Cancelar
        </button>
      </div>
    </form>
  )
}
