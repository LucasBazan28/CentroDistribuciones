"use client"

import { useState, useMemo } from "react"
import { AlertCircle, Eye, Edit2, X } from "lucide-react"

interface Articulo {
  id: number
  referencia: string
  cc: number
  descripcion: string
  embalaje: string
  precio_unitario: number
  moneda_id: number
  stock_minimo: number
  stock: number
  observacion: string | null
  marca_id: number | null
  activo: boolean
  grupo_descuento_id: number
  categoria_id: number | null
  marcas?: { nombre: string } | null
  grupo_descuento?: { nombre: string }
  categorias?: { nombre: string } | null
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

  // Extract unique marcas and categorias
  const { marcas, categorias } = useMemo(() => {
    const marcasSet = new Set<string>()
    const categoriasSet = new Set<string>()

    initialData.forEach(art => {
      if (art.marcas?.nombre) marcasSet.add(art.marcas.nombre)
      if (art.categorias?.nombre) categoriasSet.add(art.categorias.nombre)
    })

    return {
      marcas: Array.from(marcasSet).sort(),
      categorias: Array.from(categoriasSet).sort(),
    }
  }, [initialData])

  // Apply all filters
  const filteredArticulos = useMemo(() => {
    return initialData.filter(art => {
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
  }, [initialData, searchTerm, selectedMarca, selectedCategoria, stockBajoOnly, statusFilter])

  const hasActiveFilters = selectedMarca || selectedCategoria || stockBajoOnly || statusFilter !== "all"

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
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
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
          <div className="text-2xl font-bold text-gray-900 mt-1">{initialData.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Stock Bajo</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {initialData.filter(a => a.stock < a.stock_minimo).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Activos</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {initialData.filter(a => a.activo).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Stock Total</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {initialData.reduce((sum, a) => sum + a.stock, 0)}
          </div>
        </div>
      </div>
    </div>
  )
}
