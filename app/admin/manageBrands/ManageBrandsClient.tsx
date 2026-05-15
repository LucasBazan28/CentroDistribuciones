"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, X, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import BackToAdminButton from "@/app/components/BackToAdminButton"

interface Brand {
  id: string
  nombre: string
}

export default function ManageBrandsClient() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [newBrandName, setNewBrandName] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/marcas")
      if (!response.ok) throw new Error("Error al cargar las marcas")
      const data = await response.json()
      setBrands(data)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las marcas")
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = async () => {
    if (!newBrandName.trim()) {
      setError("El nombre de la marca es requerido")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/marcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newBrandName.trim() }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error al crear la marca")

      setBrands([...brands, data])
      setNewBrandName("")
      setIsAddingNew(false)
      setError("")
      setSuccess("Marca creada exitosamente")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la marca")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id)
    setEditName(brand.nombre)
  }

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setError("El nombre de la marca es requerido")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/marcas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, nombre: editName.trim() }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error al actualizar la marca")

      setBrands(brands.map(b => b.id === editingId ? data : b))
      setEditingId(null)
      setEditName("")
      setError("")
      setSuccess("Marca actualizada exitosamente")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la marca")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta marca?")) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/marcas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar la marca")
      }

      setBrands(brands.filter(b => b.id !== id))
      setError("")
      setSuccess("Marca eliminada exitosamente")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar la marca")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
        <BackToAdminButton />
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Administrar Marcas</h1>
            {!isAddingNew && (
              <button
                onClick={() => {
                  setIsAddingNew(true)
                  setSuccess("")
                }}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Plus size={20} />
                Nueva Marca
              </button>
            )}
          </div>
          <p className="text-gray-600">Gestiona todas tus marcas disponibles</p>
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
              <h3 className="font-semibold">Éxito</h3>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {isAddingNew && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Nueva Marca</h2>
              <button
                onClick={() => {
                  setIsAddingNew(false)
                  setNewBrandName("")
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddNew()}
                  placeholder="e.g., Nike"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleAddNew}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Guardar
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsAddingNew(false)
                    setNewBrandName("")
                  }}
                  className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Cargando...</span>
          </div>
        ) : (
          <>
            {/* Brands Table */}
            {brands.length > 0 ? (
              <div className="mb-8 rounded-lg border border-gray-200 bg-white shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brands.map((brand, idx) => (
                        <tr
                          key={brand.id}
                          className={`border-b border-gray-200 hover:bg-gray-50 ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          {editingId === brand.id ? (
                            <>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingId(null)
                                      setEditName("")
                                    }}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                    className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-60"
                                  >
                                    {isSaving && <Loader2 size={14} className="animate-spin" />}
                                    Guardar
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{brand.nombre}</td>
                              <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingId(brand.id)
                                    setEditName(brand.nombre)
                                  }}
                                  disabled={isSaving}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Edit size={16} />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(brand.id)}
                                  disabled={isSaving}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 size={16} />
                                  Eliminar
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mb-8 rounded-lg border border-gray-200 bg-white p-12 text-center shadow">
                <p className="text-gray-500">No hay marcas aún. Crea una para empezar.</p>
              </div>
            )}
          </>
        )}

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Volver al Panel de Administración
          </Link>
        </div>
      </div>
    </div>
  )
}
