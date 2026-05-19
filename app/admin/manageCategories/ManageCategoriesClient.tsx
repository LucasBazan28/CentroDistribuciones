"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, X, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import BackToAdminButton from "@/app/components/BackToAdminButton"
interface Brand {
  id: string
  nombre: string
}

interface Category {
  id: string
  nombre: string
  marca_id: string
}

interface GroupedCategories {
  [marcaId: string]: {
    brand: Brand
    categories: Category[]
  }
}

export default function ManageCategoriesClient() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [grouped, setGrouped] = useState<GroupedCategories>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [addingToMarcaId, setAddingToMarcaId] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [brandsRes, categoriesRes] = await Promise.all([
        fetch("/api/marcas"),
        fetch("/api/categorias"),
      ])

      if (!brandsRes.ok || !categoriesRes.ok) throw new Error("Error al cargar los datos")

      const brandsData: Brand[] = await brandsRes.json()
      const categoriesData: Category[] = await categoriesRes.json()

      setBrands(brandsData)

      const groupedData: GroupedCategories = {}
      brandsData.forEach(brand => {
        groupedData[brand.id] = {
          brand,
          categories: categoriesData.filter(cat => cat.marca_id === brand.id),
        }
      })

      setGrouped(groupedData)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (marcaId: string) => {
    if (!newCategoryName.trim()) {
      setError("El nombre de la categoría es requerido")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newCategoryName.trim(), marca_id: marcaId }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error al crear la categoría")

      const newGrouped = { ...grouped }
      newGrouped[marcaId].categories.push(data)
      setGrouped(newGrouped)

      setNewCategoryName("")
      setAddingToMarcaId(null)
      setError("")
      setSuccess("Categoría creada exitosamente")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la categoría")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveEdit = async (marcaId: string) => {
    if (!editName.trim()) {
      setError("El nombre de la categoría es requerido")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/categorias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, nombre: editName.trim(), marca_id: marcaId }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error al actualizar la categoría")

      const newGrouped = { ...grouped }
      const idx = newGrouped[marcaId].categories.findIndex(c => c.id === editingId)
      if (idx !== -1) {
        newGrouped[marcaId].categories[idx] = data
      }
      setGrouped(newGrouped)

      setEditingId(null)
      setEditName("")
      setError("")
      setSuccess("Categoría actualizada exitosamente")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la categoría")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async (marcaId: string, categoryId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/categorias", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: categoryId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar la categoría")
      }

      const newGrouped = { ...grouped }
      newGrouped[marcaId].categories = newGrouped[marcaId].categories.filter(c => c.id !== categoryId)
      setGrouped(newGrouped)
      setError("")
      setSuccess("Categoría eliminada exitosamente")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar la categoría")
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
            <h1 className="text-4xl font-bold text-gray-900">Administrar Categorías</h1>
          </div>
          <p className="text-gray-600">Organiza categorías de productos por marca</p>
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

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Cargando...</span>
          </div>
        ) : (
          <>
            {/* Categories by Brand */}
            <div className="space-y-8">
              {brands.map((brand) => {
                const categories = grouped[brand.id]?.categories || []
                return (
                  <div key={brand.id} className="rounded-lg border border-gray-200 bg-white shadow overflow-hidden">
                    {/* Brand Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-900">{brand.nombre}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {categories.length} categoría{categories.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Categories List */}
                    {categories.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {categories.map((category) => (
                          <div key={category.id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              {editingId === category.id ? (
                                <>
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSaveEdit(brand.id)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                  />
                                  <div className="ml-4 flex gap-2">
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
                                      onClick={() => handleSaveEdit(brand.id)}
                                      disabled={isSaving}
                                      className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-60"
                                    >
                                      {isSaving && <Loader2 size={14} className="animate-spin" />}
                                      Guardar
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm font-medium text-gray-900">{category.nombre}</span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingId(category.id)
                                        setEditName(category.nombre)
                                      }}
                                      disabled={isSaving}
                                      className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Edit size={16} />
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(brand.id, category.id)}
                                      disabled={isSaving}
                                      className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Trash2 size={16} />
                                      Eliminar
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Add Category Form */}
                        {addingToMarcaId === brand.id ? (
                          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleAddCategory(brand.id)}
                                placeholder="e.g., Zapatillas"
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <button
                                onClick={() => {
                                  setAddingToMarcaId(null)
                                  setNewCategoryName("")
                                }}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                              >
                                <X size={20} />
                              </button>
                              <button
                                onClick={() => handleAddCategory(brand.id)}
                                disabled={isSaving}
                                className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-60"
                              >
                                {isSaving && <Loader2 size={16} className="animate-spin" />}
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingToMarcaId(brand.id)}
                            className="w-full px-6 py-4 text-left text-primary hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium border-t border-gray-200"
                          >
                            <Plus size={18} />
                            Agregar Categoría
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <p className="text-gray-500 mb-4">No hay categorías para esta marca aún</p>
                        {addingToMarcaId === brand.id ? (
                          <div className="px-6 py-4">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleAddCategory(brand.id)}
                                placeholder="e.g., Zapatillas"
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <button
                                onClick={() => {
                                  setAddingToMarcaId(null)
                                  setNewCategoryName("")
                                }}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                              >
                                <X size={20} />
                              </button>
                              <button
                                onClick={() => handleAddCategory(brand.id)}
                                disabled={isSaving}
                                className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-60"
                              >
                                {isSaving && <Loader2 size={16} className="animate-spin" />}
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingToMarcaId(brand.id)}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            <Plus size={20} />
                            Crear Categoría
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {brands.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow">
                <p className="text-gray-500">No hay marcas. Crea marcas primero.</p>
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
