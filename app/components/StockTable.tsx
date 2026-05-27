"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { uploadImageToCloudinary, validateImageFile } from "@/lib/imageUpload"
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser"
import { AlertCircle, Edit2, X, Save, Loader, Image as ImageIcon, Trash2 } from "lucide-react"

interface Articulo {
  id: number
  referencia: string
  cc: string
  descripcion: string
  embalaje: string
  precio_unitario: number
  moneda_id: number
  stock_minimo: number
  stock: number
  observacion: string | null
  marca_id: number
  activo: boolean
  grupo_descuento_id: number | null
  categoria_id: number
  imageURL?: string | null
  marcas?: { nombre: string }
  grupo_descuento?: { nombre: string } | null
  categorias?: { nombre: string }
}

interface StockTableProps {
  initialData: Articulo[]
}

export default function StockTable({ initialData }: StockTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMarca, setSelectedMarca] = useState<string | null>(null)
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null)
  const [stockBajoOnly, setStockBajoOnly] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<Articulo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Articulo[]>(initialData)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [gruposDescuentoFiltrados, setGruposDescuentoFiltrados] = useState<any[]>([])
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<any[]>([])
  const [allGruposDescuento, setAllGruposDescuento] = useState<any[]>([])
  const [allCategorias, setAllCategorias] = useState<any[]>([])
  const [allMarcas, setAllMarcas] = useState<any[]>([])
  const editFormRef = useRef<HTMLDivElement>(null)

  // Extract unique marcas and categorias
  const { marcas, categorias } = useMemo(() => {
    const marcasSet = new Set<string>()
    const categoriasSet = new Set<string>()

    data.forEach(art => {
      if (art.marcas?.nombre) marcasSet.add(art.marcas.nombre)
      if (art.categorias?.nombre) categoriasSet.add(art.categorias.nombre)
    })

    return {
      marcas: Array.from(marcasSet).sort(),
      categorias: Array.from(categoriasSet).sort(),
    }
  }, [data])

  // Apply all filters
  const filteredArticulos = useMemo(() => {
    return data.filter(art => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch =
          art.referencia.toLowerCase().includes(search) ||
          art.descripcion.toLowerCase().includes(search) ||
          art.marcas?.nombre?.toLowerCase().includes(search)

        if (!matchesSearch) return false
      }

      // Marca filter
      if (selectedMarca && art.marcas?.nombre !== selectedMarca) {
        return false
      }

      // Categoria filter
      if (selectedCategoria && art.categorias?.nombre !== selectedCategoria) {
        return false
      }

      // Stock bajo filter
      if (stockBajoOnly && art.stock >= art.stock_minimo) {
        return false
      }

      // Status filter
      if (statusFilter === "active" && !art.activo) {
        return false
      }
      if (statusFilter === "inactive" && art.activo) {
        return false
      }

      return true
    })
  }, [data, searchTerm, selectedMarca, selectedCategoria, stockBajoOnly, statusFilter])

  const hasActiveFilters = selectedMarca || selectedCategoria || stockBajoOnly || statusFilter !== "all"

  // Scroll to edit form when editing
  useEffect(() => {
    if (editingId !== null && editFormRef.current) {
      setTimeout(() => {
        editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }, [editingId])

  // Load grupos descuento and categorias for editing
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const supabase = createSupabaseBrowserClient()

        const gruposRes = await supabase.from("grupo_descuento").select("*").order("nombre")
        if (gruposRes.error) throw gruposRes.error
        setAllGruposDescuento(gruposRes.data || [])

        const categoriasRes = await supabase.from("categorias").select("*").order("nombre")
        if (categoriasRes.error) throw categoriasRes.error
        setAllCategorias(categoriasRes.data || [])

        const marcasRes = await supabase.from("marcas").select("*").order("nombre")
        if (marcasRes.error) throw marcasRes.error
        setAllMarcas(marcasRes.data || [])
      } catch (err) {
        console.error("Failed to load dropdown data:", err)
      }
    }

    loadDropdownData()
  }, [])

  const handleEdit = (articulo: Articulo) => {
    setEditingId(articulo.id)
    setEditingData({ ...articulo })
    setError(null)

    // Filter grupos descuento and categorias by brand
    if (articulo.marca_id) {
      const filteredGrupos = allGruposDescuento.filter(g => g.marca_id === articulo.marca_id)
      setGruposDescuentoFiltrados(filteredGrupos)

      const filteredCats = allCategorias.filter(c => c.marca_id === articulo.marca_id || c.id === 14)
      setCategoriasFiltradas(filteredCats)
    } else {
      setGruposDescuentoFiltrados([])
      setCategoriasFiltradas([])
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingData(null)
    setError(null)
    setEditImageFile(null)
    setEditImagePreview(null)
    setImageUploadError(null)
    setGruposDescuentoFiltrados([])
    setCategoriasFiltradas([])
  }

  const handleEditMarcaChange = (newMarcaId: number | null) => {
    if (!editingData || newMarcaId === null) return

    const updatedData = { ...editingData, marca_id: newMarcaId }
    setEditingData(updatedData)

    if (newMarcaId) {
      const filteredGrupos = allGruposDescuento.filter(g => g.marca_id === newMarcaId)
      setGruposDescuentoFiltrados(filteredGrupos)

      const filteredCats = allCategorias.filter(c => c.marca_id === newMarcaId || c.id === 14)
      setCategoriasFiltradas(filteredCats)
    } else {
      setGruposDescuentoFiltrados([])
      setCategoriasFiltradas([])
    }
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploadError(null)

    // Validate file
    const validationError = validateImageFile(file)
    if (validationError) {
      setImageUploadError(validationError)
      return
    }

    setEditImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setEditImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearEditImage = () => {
    setEditImageFile(null)
    setEditImagePreview(null)
    setImageUploadError(null)
  }

  const handleSaveEdit = async () => {
    if (!editingData) return

    if (!editingData.marca_id) {
      setError("Marca es requerida")
      return
    }

    if (!editingData.categoria_id) {
      setError("Categoría es requerida")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let imageURLToUse = editingData.imageURL

      // Upload image if selected
      if (editImageFile) {
        try {
          imageURLToUse = await uploadImageToCloudinary(editImageFile)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to upload image"
          setError(`Image upload error: ${errorMessage}`)
          setIsLoading(false)
          return
        }
      }

      const response = await fetch("/api/articulos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingData.id,
          referencia: editingData.referencia,
          cc: editingData.cc,
          descripcion: editingData.descripcion,
          embalaje: editingData.embalaje,
          precio_unitario: editingData.precio_unitario,
          moneda_id: editingData.moneda_id,
          stock_minimo: editingData.stock_minimo,
          stock: editingData.stock,
          observacion: editingData.observacion,
          marca_id: editingData.marca_id,
          grupo_descuento_id: editingData.grupo_descuento_id,
          categoria_id: editingData.categoria_id,
          activo: editingData.activo,
          imageURL: imageURLToUse || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update product")
      }

      const updatedProduct = await response.json()

      // Update data with the new product
      setData(data.map(item => item.id === updatedProduct.id ? updatedProduct : item))
      setEditingId(null)
      setEditingData(null)
      setEditImageFile(null)
      setEditImagePreview(null)
      setImageUploadError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating product")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (articulo: Articulo) => {
    if (!confirm(`¿Está seguro de que desea eliminar el producto "${articulo.referencia}"?`)) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/articulos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: articulo.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete product")
      }

      // Remove product from data
      setData(data.filter(item => item.id !== articulo.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting product")
    } finally {
      setIsLoading(false)
    }
  }

  if (initialData.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">No hay artículos</p>
          <p className="text-sm text-red-800">No se encontraron artículos en la base de datos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar por referencia, descripción o marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* Marca Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <select
            value={selectedMarca || ""}
            onChange={(e) => setSelectedMarca(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">Todas</option>
            {marcas.map(marca => (
              <option key={marca} value={marca}>
                {marca}
              </option>
            ))}
          </select>
        </div>

        {/* Categoria Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={selectedCategoria || ""}
            onChange={(e) => setSelectedCategoria(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">Todas</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {/* Stock Bajo Filter */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="stockBajo"
            checked={stockBajoOnly}
            onChange={(e) => setStockBajoOnly(e.target.checked)}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
          />
          <label htmlFor="stockBajo" className="text-sm font-medium text-gray-700 cursor-pointer">
            Stock Bajo
          </label>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedMarca(null)
              setSelectedCategoria(null)
              setStockBajoOnly(false)
              setStatusFilter("all")
            }}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="Limpiar filtros"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Referencia</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Descripción</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Marca</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Categoría</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900">CC</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900">Precio</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900">Stock</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900">Stock Mín.</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900">Estado</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticulos.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No se encontraron artículos
                </td>
              </tr>
            ) : (
              filteredArticulos.map((articulo) => (
                <tr key={articulo.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">{articulo.referencia}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{articulo.descripcion}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {articulo.marcas?.nombre || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {articulo.categorias?.nombre || "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{articulo.cc}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">
                    ${articulo.precio_unitario.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      articulo.stock < articulo.stock_minimo
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {articulo.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{articulo.stock_minimo}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      articulo.activo
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {articulo.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDelete(articulo)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(articulo)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Total Artículos</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{data.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Stock Bajo</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {data.filter(a => a.stock < a.stock_minimo).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Activos</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {data.filter(a => a.activo).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Stock Total</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {data.reduce((sum, a) => sum + a.stock, 0)}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editingId !== null && editingData && (
        <div ref={editFormRef} className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Editar Producto</h2>
            <button
              onClick={handleCancelEdit}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Referencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
              <input
                type="text"
                value={editingData.referencia}
                onChange={(e) => setEditingData({ ...editingData, referencia: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>

            {/* CC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
              <input
                type="text"
                value={editingData.cc}
                onChange={(e) => setEditingData({ ...editingData, cc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={editingData.descripcion}
                onChange={(e) => setEditingData({ ...editingData, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                disabled={isLoading}
              />
            </div>

            {/* Embalaje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Embalaje</label>
              <input
                type="text"
                value={editingData.embalaje}
                onChange={(e) => setEditingData({ ...editingData, embalaje: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca <span className="text-red-500">*</span></label>
              <select
                value={editingData.marca_id || ""}
                onChange={(e) => handleEditMarcaChange(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
                required
              >
                <option value="">Seleccionar marca</option>
                {allMarcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría <span className="text-red-500">*</span></label>
              <select
                value={editingData.categoria_id || ""}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : null
                  if (value !== null) {
                    setEditingData({ ...editingData, categoria_id: value })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                disabled={isLoading || !editingData.marca_id}
                required
              >
                <option value="">{editingData.marca_id ? "Seleccionar categoría" : "Selecciona una marca primero"}</option>
                {categoriasFiltradas.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Grupo Descuento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Descuento</label>
              <select
                value={editingData.grupo_descuento_id || ""}
                onChange={(e) => setEditingData({ ...editingData, grupo_descuento_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                disabled={isLoading || !editingData.marca_id}
              >
                <option value="">{editingData.marca_id ? "Seleccionar grupo de descuento (opcional)" : "Selecciona una marca primero"}</option>
                {gruposDescuentoFiltrados.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nombre} ({grupo.descuento}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Precio Unitario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario</label>
              <input
                type="number"
                value={editingData.precio_unitario}
                onChange={(e) => setEditingData({ ...editingData, precio_unitario: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
                step="0.01"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={editingData.stock}
                onChange={(e) => setEditingData({ ...editingData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>

            {/* Stock Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
              <input
                type="number"
                value={editingData.stock_minimo}
                onChange={(e) => setEditingData({ ...editingData, stock_minimo: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>

            {/* Observación */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
              <textarea
                value={editingData.observacion || ""}
                onChange={(e) => setEditingData({ ...editingData, observacion: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                disabled={isLoading}
              />
            </div>

            {/* Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
              <div className="space-y-3">
                {/* Current Image */}
                {(editImagePreview || editingData.imageURL) && !editImageFile && (
                  <div className="relative w-full max-w-xs">
                    <img
                      src={editImagePreview || editingData.imageURL || ""}
                      alt="Current"
                      className="w-full h-40 object-cover rounded-lg border border-gray-300"
                    />
                    <p className="mt-2 text-xs text-gray-500">Imagen actual</p>
                  </div>
                )}

                {/* File Input */}
                <div className="relative">
                  <input
                    id="editImageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                  <label
                    htmlFor="editImageFile"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {editImageFile ? editImageFile.name : "Click para seleccionar imagen"}
                    </span>
                  </label>
                </div>

                {/* Image Preview */}
                {editImagePreview && editImageFile && (
                  <div className="relative">
                    <div className="relative w-full max-w-xs">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={clearEditImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remover imagen"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Tamaño: {(editImageFile?.size || 0) / 1024 / 1024 < 1 ? ((editImageFile?.size || 0) / 1024).toFixed(0) : ((editImageFile?.size || 0) / 1024 / 1024).toFixed(2)} {(editImageFile?.size || 0) / 1024 / 1024 < 1 ? "KB" : "MB"}
                    </p>
                  </div>
                )}

                {/* Image Upload Error */}
                {imageUploadError && (
                  <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-red-600">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{imageUploadError}</p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Formatos: JPG, PNG, GIF, WebP. Máximo: 5MB
              </p>
            </div>

            {/* Activo */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                checked={editingData.activo}
                onChange={(e) => setEditingData({ ...editingData, activo: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <label htmlFor="activo" className="text-sm font-medium text-gray-700">Activo</label>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
