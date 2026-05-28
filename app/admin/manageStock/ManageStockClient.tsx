"use client"

import { useState, useEffect } from "react"
import StockTable from "@/app/components/StockTable"
import { ChevronRight, Loader } from "lucide-react"

interface Marca {
  id: number
  nombre: string
}

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
  marcas?: { nombre: string }
  grupo_descuento?: { nombre: string } | null
  categorias?: { nombre: string }
  iva: number
  ganancia: number
}

interface ManageStockClientProps {
  marcas: Marca[]
}

export default function ManageStockClient({ marcas }: ManageStockClientProps) {
  const [selectedMarcaId, setSelectedMarcaId] = useState<number | null>(null)
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedMarca = marcas.find(m => m.id === selectedMarcaId)

  const handleSelectMarca = async (marcaId: number) => {
    setSelectedMarcaId(marcaId)
    setIsLoading(true)
    setError(null)

    try {
      let allArticulos: Articulo[] = []
      let offset = 0
      const pageSize = 300

      while (true) {
        const params = new URLSearchParams()
        params.set("marca_id", marcaId.toString())
        params.set("offset", offset.toString())
        params.set("limit", pageSize.toString())

        const response = await fetch(`/api/articulos?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch articulos")
        }

        const chunk = await response.json()
        if (!chunk || chunk.length === 0) break

        allArticulos = [...allArticulos, ...chunk]

        if (chunk.length < pageSize) {
          break
        }

        offset += pageSize
      }

      setArticulos(allArticulos)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading products")
      setArticulos([])
    } finally {
      setIsLoading(false)
    }
  }

  // If no marca selected, show marca selector
  if (!selectedMarcaId) {
    return (
      <div className="space-y-6">
        {/* Marca Selector */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Selecciona una marca para administrar su stock
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marcas.map((marca) => (
              <button
                key={marca.id}
                onClick={() => handleSelectMarca(marca.id)}
                className="group relative overflow-hidden rounded-lg border-2 border-gray-200 p-6 text-left transition-all hover:border-primary hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {marca.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Click para ver inventario</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>

          {marcas.length === 0 && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-800">No hay marcas disponibles</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">💡 Tip:</p>
          <p className="mt-1">
            Selecciona una marca para ver y administrar todos los productos de esa marca. Esto permite trabajar con datos más manejables.
          </p>
        </div>
      </div>
    )
  }

  // If marca selected, show back button and stock table
  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => {
              setSelectedMarcaId(null)
              setArticulos([])
              setError(null)
            }}
            className="text-sm text-primary hover:text-primary-dark transition-colors mb-2"
          >
            ← Cambiar marca
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            Stock de {selectedMarca?.nombre}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isLoading ? "Cargando..." : `${articulos.length} productos encontrados`}
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="rounded-lg bg-white p-12 text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Stock Table */}
      {!isLoading && !error && (
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {articulos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay productos para esta marca</p>
            </div>
          ) : (
            <StockTable initialData={articulos} preselectedMarcaId={selectedMarcaId} />
          )}
        </div>
      )}

      {/* Info Box */}
      {!isLoading && !error && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">📊 Información útil:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Los artículos con stock rojo están por debajo del mínimo requerido</li>
            <li>Puedes buscar artículos por referencia, descripción o marca</li>
            <li>Los resúmenes al final muestran estadísticas del inventario</li>
            <li>Usa el botón editar para modificar detalles de los productos</li>
          </ul>
        </div>
      )}
    </div>
  )
}
