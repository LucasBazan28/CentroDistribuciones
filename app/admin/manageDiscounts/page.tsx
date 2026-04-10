"use client"

import { useState, useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser"
import { AlertCircle, CheckCircle, Loader2, Plus, Trash2, Edit2, X, Save } from "lucide-react"
import Link from "next/link"

interface Marca {
  id: number
  nombre: string
}

interface GrupoDescuento {
  id: number
  nombre: string
  descuento: number
  marca_id: number
}

interface FormState {
  nombre: string
  descuento: string
  marca_id: string
}

export default function ManageDiscountsPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [gruposPorMarca, setGruposPorMarca] = useState<Map<number, GrupoDescuento[]>>(new Map())

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormState>({
    nombre: "",
    descuento: "",
    marca_id: "",
  })

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const supabase = createSupabaseBrowserClient()

        // Fetch marcas
        const { data: marcasData, error: marcasError } = await supabase
          .from("marcas")
          .select("*")
          .order("nombre")

        if (marcasError) throw marcasError
        setMarcas(marcasData || [])

        // Fetch grupos de descuento
        const { data: gruposData, error: gruposError } = await supabase
          .from("grupo_descuento")
          .select("*")
          .order("marca_id, nombre")

        if (gruposError) throw gruposError

        // Group by marca_id
        const grouped = new Map<number, GrupoDescuento[]>()
        gruposData?.forEach((grupo) => {
          if (!grouped.has(grupo.marca_id)) {
            grouped.set(grupo.marca_id, [])
          }
          grouped.get(grupo.marca_id)!.push(grupo)
        })
        setGruposPorMarca(grouped)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error loading data"
        setError(`Failed to load data: ${message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData({ nombre: "", descuento: "", marca_id: "" })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.nombre || !formData.descuento || !formData.marca_id) {
      setError("All fields are required")
      return
    }

    try {
      setSubmitting(true)

      const endpoint = editingId ? "/api/grupo-descuento" : "/api/grupo-descuento"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId && { id: editingId }),
          nombre: formData.nombre,
          descuento: parseFloat(formData.descuento),
          marca_id: parseInt(formData.marca_id),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${editingId ? "update" : "create"} discount group`)
      }

      setSuccess(`Discount group ${editingId ? "updated" : "created"} successfully`)

      // Refresh data
      const supabase = createSupabaseBrowserClient()
      const { data: gruposData, error: gruposError } = await supabase
        .from("grupo_descuento")
        .select("*")
        .order("marca_id, nombre")

      if (gruposError) throw gruposError

      const grouped = new Map<number, GrupoDescuento[]>()
      gruposData?.forEach((grupo) => {
        if (!grouped.has(grupo.marca_id)) {
          grouped.set(grupo.marca_id, [])
        }
        grouped.get(grupo.marca_id)!.push(grupo)
      })
      setGruposPorMarca(grouped)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error saving discount group"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (grupo: GrupoDescuento) => {
    setFormData({
      nombre: grupo.nombre,
      descuento: grupo.descuento.toString(),
      marca_id: grupo.marca_id.toString(),
    })
    setEditingId(grupo.id)
    setShowForm(true)
    setSuccess("")
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this discount group?")) return

    try {
      setSubmitting(true)

      const response = await fetch("/api/grupo-descuento", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete discount group")
      }

      setSuccess("Discount group deleted successfully")

      // Refresh data
      const supabase = createSupabaseBrowserClient()
      const { data: gruposData, error: gruposError } = await supabase
        .from("grupo_descuento")
        .select("*")
        .order("marca_id, nombre")

      if (gruposError) throw gruposError

      const grouped = new Map<number, GrupoDescuento[]>()
      gruposData?.forEach((grupo) => {
        if (!grouped.has(grupo.marca_id)) {
          grouped.set(grupo.marca_id, [])
        }
        grouped.get(grupo.marca_id)!.push(grupo)
      })
      setGruposPorMarca(grouped)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error deleting discount group"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Manage Discounts</h1>
            {!showForm && (
              <button
                onClick={() => {
                  setShowForm(true)
                  setSuccess("")
                }}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Plus size={20} />
                New Discount
              </button>
            )}
          </div>
          <p className="text-gray-600">Organize discount groups by brand</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex gap-3 rounded-lg bg-red-50 p-4 text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0 pt-0.5" />
            <div>
              <h3 className="font-semibold">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex gap-3 rounded-lg bg-green-50 p-4 text-green-600">
            <CheckCircle className="h-5 w-5 flex-shrink-0 pt-0.5" />
            <div>
              <h3 className="font-semibold">Success</h3>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? "Edit Discount Group" : "Create New Discount Group"}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="marca_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="marca_id"
                    name="marca_id"
                    value={formData.marca_id}
                    onChange={handleChange}
                    required
                    disabled={!!editingId}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a brand</option>
                    {marcas.map((marca) => (
                      <option key={marca.id} value={marca.id}>
                        {marca.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Premium"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="descuento" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%) <span className="text-red-500">*</span>
                </label>
                <input
                  id="descuento"
                  name="descuento"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.descuento}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 15.50"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Discount Groups by Brand */}
        <div className="space-y-8">
          {marcas.map((marca) => {
            const grupos = gruposPorMarca.get(marca.id) || []
            return (
              <div key={marca.id} className="rounded-lg border border-gray-200 bg-white shadow overflow-hidden">
                {/* Brand Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">{marca.nombre}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {grupos.length} discount group{grupos.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Groups Table */}
                {grupos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Discount</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grupos.map((grupo, idx) => (
                          <tr
                            key={grupo.id}
                            className={`border-b border-gray-200 hover:bg-gray-50 ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{grupo.nombre}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{grupo.descuento}%</td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(grupo)}
                                disabled={submitting}
                                className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit2 size={16} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(grupo.id)}
                                disabled={submitting}
                                className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <p>No discount groups for this brand yet</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
