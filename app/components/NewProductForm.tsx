"use client"

import { useState, useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser"
import { AlertCircle, CheckCircle, Loader2, Save } from "lucide-react"

interface Moneda {
  id: number
  codigo: string
  descripcion?: string
}

interface Marca {
  id: number
  nombre: string
}

export default function NewProductForm() {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [monedas, setMonedas] = useState<Moneda[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])

  const [formData, setFormData] = useState({
    referencia: "",
    cc: "",
    descripcion: "",
    embalaje: "",
    precio_unitario: "",
    moneda_id: "2",
    stock_minimo: "0",
    stock: "0",
    observacion: "",
    marca_id: "",
  })

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true)
        const supabase = createSupabaseBrowserClient()

        // Log current user
        const { data: { user } } = await supabase.auth.getUser()
        console.log("Current user:", user?.id)

        const monedasRes = await supabase.from("monedas").select("*").order("id")
        console.log("Monedas full response:", monedasRes)

        if (monedasRes.error) {
          console.error("Monedas error:", monedasRes.error)
          throw monedasRes.error
        }

        setMonedas(monedasRes.data || [])

        const marcasRes = await supabase.from("marcas").select("*").order("nombre")
        if (marcasRes.error) throw marcasRes.error
        setMarcas(marcasRes.data || [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error loading data"
        setError(`Failed to load form data: ${message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchDropdownData()
  }, [])

  const resetForm = () => {
    setFormData({
      referencia: "",
      cc: "",
      descripcion: "",
      embalaje: "",
      precio_unitario: "",
      moneda_id: "2",
      stock_minimo: "0",
      stock: "0",
      observacion: "",
      marca_id: "",
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    try {
      setSubmitting(true)

      const response = await fetch("/api/articulos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product")
      }

      setSuccess(true)
      resetForm()
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error creating product"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Cargando formulario...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0 pt-0.5" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex gap-3 rounded-lg bg-green-50 p-4 text-green-600">
          <CheckCircle className="h-5 w-5 flex-shrink-0 pt-0.5" />
          <div>
            <h3 className="font-semibold">Éxito</h3>
            <p className="text-sm">Producto creado correctamente</p>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="referencia" className="block text-sm font-medium text-gray-700 mb-2">
              Referencia <span className="text-red-500">*</span>
            </label>
            <input
              id="referencia"
              name="referencia"
              type="text"
              value={formData.referencia}
              onChange={handleChange}
              required
              placeholder="ej: REF-001"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="cc" className="block text-sm font-medium text-gray-700 mb-2">
              CC <span className="text-red-500">*</span>
            </label>
            <input
              id="cc"
              name="cc"
              type="number"
              value={formData.cc}
              onChange={handleChange}
              required
              placeholder="ej: 123"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            placeholder="Descripción detallada del producto"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="observacion" className="block text-sm font-medium text-gray-700 mb-2">
            Observación
          </label>
          <textarea
            id="observacion"
            name="observacion"
            value={formData.observacion}
            onChange={handleChange}
            placeholder="Notas adicionales (opcional)"
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Pricing and Stock */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900">Precios y Stock</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="precio_unitario" className="block text-sm font-medium text-gray-700 mb-2">
              Precio Unitario <span className="text-red-500">*</span>
            </label>
            <input
              id="precio_unitario"
              name="precio_unitario"
              type="number"
              step="0.01"
              value={formData.precio_unitario}
              onChange={handleChange}
              required
              min="0"
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="moneda_id" className="block text-sm font-medium text-gray-700 mb-2">
              Moneda <span className="text-red-500">*</span>
            </label>
            <select
              id="moneda_id"
              name="moneda_id"
              value={formData.moneda_id}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Seleccionar moneda</option>
              {monedas.map((moneda) => (
                <option key={moneda.id} value={moneda.id}>
                  {moneda.codigo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="stock_minimo" className="block text-sm font-medium text-gray-700 mb-2">
              Stock Mínimo
            </label>
            <input
              id="stock_minimo"
              name="stock_minimo"
              type="number"
              value={formData.stock_minimo}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900">Detalles del Producto</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="embalaje" className="block text-sm font-medium text-gray-700 mb-2">
              Embalaje <span className="text-red-500">*</span>
            </label>
            <input
              id="embalaje"
              name="embalaje"
              type="number"
              value={formData.embalaje}
              onChange={handleChange}
              required
              min="1"
              placeholder="ej: 10"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="marca_id" className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <select
              id="marca_id"
              name="marca_id"
              value={formData.marca_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Sin marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creando producto...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Crear Producto
            </>
          )}
        </button>

        <button
          type="button"
          onClick={resetForm}
          className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          Limpiar
        </button>
      </div>
    </form>
  )
}
