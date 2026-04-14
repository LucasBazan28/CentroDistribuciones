"use client"

import { useState, useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser"
import { AlertCircle, Loader2, Eye, Edit2 } from "lucide-react"

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

export default function StockTable() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchArticulos = async () => {
      try {
        setLoading(true)
        const supabase = createSupabaseBrowserClient()

        const { data, error } = await supabase
          .from("articulos")
          .select("*, marcas(nombre), grupo_descuento(nombre), categorias(nombre)")
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }
        console.log("Fetched articulos:", data)
        setArticulos(data || [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error loading articulos"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchArticulos()
  }, [])

  const filteredArticulos = articulos.filter(art =>
    art.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.marcas?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">Error al cargar artículos</p>
          <p className="text-sm text-red-800">{error}</p>
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

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Referencia</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Descripción</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Marca</th>
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
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
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
          <div className="text-2xl font-bold text-gray-900 mt-1">{articulos.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Stock Bajo</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {articulos.filter(a => a.stock < a.stock_minimo).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Activos</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {articulos.filter(a => a.activo).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Stock Total</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {articulos.reduce((sum, a) => sum + a.stock, 0)}
          </div>
        </div>
      </div>
    </div>
  )
}