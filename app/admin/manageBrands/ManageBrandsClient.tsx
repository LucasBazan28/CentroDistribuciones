"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, X, Loader2, AlertCircle } from "lucide-react"

interface Brand {
  id: string
  nombre: string
}

export default function ManageBrandsClient() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
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
      if (!response.ok) throw new Error("Failed to load brands")
      const data = await response.json()
      setBrands(data)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading brands")
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = async () => {
    if (!newBrandName.trim()) {
      setError("Brand name is required")
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
      if (!response.ok) throw new Error(data.error || "Failed to create brand")

      setBrands([...brands, data])
      setNewBrandName("")
      setIsAddingNew(false)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating brand")
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
      setError("Brand name is required")
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
      if (!response.ok) throw new Error(data.error || "Failed to update brand")

      setBrands(brands.map(b => b.id === editingId ? data : b))
      setEditingId(null)
      setEditName("")
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating brand")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/marcas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete brand")
      }

      setBrands(brands.filter(b => b.id !== id))
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting brand")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manage Brands</h1>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus size={20} />
          Add Brand
        </button>
      </div>

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
        <>
          {isAddingNew && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">New Brand</h2>
                <button
                  onClick={() => {
                    setIsAddingNew(false)
                    setNewBrandName("")
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Enter brand name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => e.key === "Enter" && handleAddNew()}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsAddingNew(false)
                    setNewBrandName("")
                  }}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNew}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Brand Name</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50">
                      {editingId === brand.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                              onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
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
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-60"
                              >
                                {isSaving && <Loader2 size={14} className="animate-spin" />}
                                Save
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-gray-900 font-medium">{brand.nombre}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(brand)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(brand.id)}
                                disabled={isSaving}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-60"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {brands.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No brands yet. Create one to get started.
            </div>
          )}
        </>
      )}
    </div>
  )
}
