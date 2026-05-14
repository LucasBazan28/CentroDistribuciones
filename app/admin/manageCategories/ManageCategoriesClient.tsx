"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, X, Loader2, AlertCircle, ChevronDown } from "lucide-react"

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [addingToMarcaId, setAddingToMarcaId] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [expandedMarcas, setExpandedMarcas] = useState<Set<string>>(new Set())

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

      if (!brandsRes.ok || !categoriesRes.ok) throw new Error("Failed to load data")

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
      setExpandedMarcas(new Set(brandsData.map(b => b.id)))
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading data")
    } finally {
      setLoading(false)
    }
  }

  const toggleMarca = (marcaId: string) => {
    const newExpanded = new Set(expandedMarcas)
    if (newExpanded.has(marcaId)) {
      newExpanded.delete(marcaId)
    } else {
      newExpanded.add(marcaId)
    }
    setExpandedMarcas(newExpanded)
  }

  const handleAddCategory = async (marcaId: string) => {
    if (!newCategoryName.trim()) {
      setError("Category name is required")
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
      if (!response.ok) throw new Error(data.error || "Failed to create category")

      const newGrouped = { ...grouped }
      newGrouped[marcaId].categories.push(data)
      setGrouped(newGrouped)

      setNewCategoryName("")
      setAddingToMarcaId(null)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating category")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.nombre)
  }

  const handleSaveEdit = async (marcaId: string) => {
    if (!editName.trim()) {
      setError("Category name is required")
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
      if (!response.ok) throw new Error(data.error || "Failed to update category")

      const newGrouped = { ...grouped }
      const idx = newGrouped[marcaId].categories.findIndex(c => c.id === editingId)
      if (idx !== -1) {
        newGrouped[marcaId].categories[idx] = data
      }
      setGrouped(newGrouped)

      setEditingId(null)
      setEditName("")
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating category")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async (marcaId: string, categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/categorias", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: categoryId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete category")
      }

      const newGrouped = { ...grouped }
      newGrouped[marcaId].categories = newGrouped[marcaId].categories.filter(c => c.id !== categoryId)
      setGrouped(newGrouped)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting category")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-600">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {brands.map((brand) => (
            <div key={brand.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleMarca(brand.id)}
                className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900">{brand.nombre}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {grouped[brand.id]?.categories.length || 0} categories
                  </span>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${expandedMarcas.has(brand.id) ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {expandedMarcas.has(brand.id) && (
                <div className="divide-y divide-gray-200">
                  {grouped[brand.id]?.categories.map((category) => (
                    <div key={category.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        {editingId === category.id ? (
                          <>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                              onKeyPress={(e) => e.key === "Enter" && handleSaveEdit(brand.id)}
                            />
                            <div className="ml-4 flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingId(null)
                                  setEditName("")
                                }}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(brand.id)}
                                disabled={isSaving}
                                className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-60"
                              >
                                {isSaving && <Loader2 size={14} className="animate-spin" />}
                                Save
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="font-medium text-gray-900">{category.nombre}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(brand.id, category.id)}
                                disabled={isSaving}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-60"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {addingToMarcaId === brand.id ? (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          onKeyPress={(e) => e.key === "Enter" && handleAddCategory(brand.id)}
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
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingToMarcaId(brand.id)}
                      className="w-full px-6 py-4 text-left text-primary hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
                    >
                      <Plus size={18} />
                      Add Category
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {brands.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No brands found. Create brands first.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
