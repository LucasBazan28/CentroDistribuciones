"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle, Edit, Loader2, Plus, Search, Trash2 } from "lucide-react"
import BackToAdminButton from "@/app/components/BackToAdminButton"
import ClientForm from "@/app/components/ClientForm"
import { Cliente, formatCuit, onlyDigits } from "@/app/lib/sales"

export default function ManageClientsClient() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [search, setSearch] = useState("")
  // null = form closed, "new" = creating, Cliente = editing
  const [editing, setEditing] = useState<Cliente | "new" | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/clientes")
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Error al cargar los clientes")
        setClientes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar los clientes")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return clientes
    const qDigits = onlyDigits(q)
    return clientes.filter(
      (c) => c.razon_social.toLowerCase().includes(q) || (qDigits && c.cuit.includes(qDigits))
    )
  }, [clientes, search])

  const handleSaved = (cliente: Cliente) => {
    const exists = clientes.some((c) => c.id === cliente.id)
    const next = exists ? clientes.map((c) => (c.id === cliente.id ? cliente : c)) : [...clientes, cliente]
    setClientes(next.sort((a, b) => a.razon_social.localeCompare(b.razon_social)))
    setSuccess(exists ? "Cliente actualizado" : "Cliente registrado")
    setError("")
    setEditing(null)
  }

  const handleDelete = async (cliente: Cliente) => {
    if (!confirm(`¿Eliminar a ${cliente.razon_social}?`)) return
    setDeletingId(cliente.id)
    try {
      const response = await fetch("/api/clientes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cliente.id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error al eliminar el cliente")
      setClientes(clientes.filter((c) => c.id !== cliente.id))
      setSuccess("Cliente eliminado")
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el cliente")
      setSuccess("")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <BackToAdminButton />
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Clientes</h1>
            {editing === null && (
              <button
                onClick={() => {
                  setEditing("new")
                  setSuccess("")
                }}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Plus size={20} />
                Registrar cliente
              </button>
            )}
          </div>
          <p className="text-gray-600">Clientes disponibles para registrar ventas</p>
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

        {editing !== null && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editing === "new" ? "Nuevo cliente" : "Editar cliente"}
            </h2>
            <ClientForm
              key={editing === "new" ? "new" : editing.id}
              initial={editing === "new" ? null : editing}
              onSaved={handleSaved}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por razón social o CUIT"
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Cargando...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow">
            <p className="text-gray-500">
              {clientes.length === 0 ? "Todavía no hay clientes registrados." : "Ningún cliente coincide con la búsqueda."}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">CUIT</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Razón social</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Contacto</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => (
                    <tr key={c.id} className={`border-b border-gray-200 ${idx % 2 ? "bg-gray-50" : "bg-white"}`}>
                      <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">{formatCuit(c.cuit)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.razon_social}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {[c.email, c.telefono].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditing(c)
                              setSuccess("")
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            <Edit size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            disabled={deletingId === c.id}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingId === c.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
