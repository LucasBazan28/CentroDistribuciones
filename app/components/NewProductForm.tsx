"use client"

import { useState, useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser"
import { uploadImageToCloudinary, validateImageFile } from "@/lib/imageUpload"
import { AlertCircle, CheckCircle, Loader2, Save, X, Image as ImageIcon } from "lucide-react"

interface Moneda {
  id: number
  codigo: string
  descripcion?: string
}

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

interface Categoria {
  id: number
  nombre: string
  marca_id: number | null
}

export default function NewProductForm() {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [monedas, setMonedas] = useState<Moneda[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [gruposDescuento, setGruposDescuento] = useState<GrupoDescuento[]>([])
  const [gruposDescuentoFiltrados, setGruposDescuentoFiltrados] = useState<GrupoDescuento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<Categoria[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)

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
    grupo_descuento_id: "",
    categoria_id: "",
    imageURL: "",
  })

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true)
        const supabase = createSupabaseBrowserClient()

        const monedasRes = await supabase.from("monedas").select("*").order("id")
        if (monedasRes.error) throw monedasRes.error
        setMonedas(monedasRes.data || [])

        const marcasRes = await supabase.from("marcas").select("*").order("nombre")
        if (marcasRes.error) throw marcasRes.error
        setMarcas(marcasRes.data || [])

        const gruposRes = await supabase.from("grupo_descuento").select("*").order("nombre")
        if (gruposRes.error) throw gruposRes.error
        setGruposDescuento(gruposRes.data || [])

        const categoriasRes = await supabase.from("categorias").select("*").order("nombre")
        if (categoriasRes.error) throw categoriasRes.error
        setCategorias(categoriasRes.data || [])
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
      grupo_descuento_id: "",
      categoria_id: "",
      imageURL: "",
    })
    setGruposDescuentoFiltrados([])
    setCategoriasFiltradas([])
    setImageFile(null)
    setImagePreview(null)
    setImageUploadError(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploadError(null)

    // Validate file
    const validationError = validateImageFile(file)
    if (validationError) {
      setImageUploadError(validationError)
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageUploadError(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "marca_id") {
      // Filter discount groups by selected brand
      const filtered = value ? gruposDescuento.filter(g => g.marca_id === Number(value)) : []
      setGruposDescuentoFiltrados(filtered)

      // Filter categories by selected brand and always include "Otros" (id=14)
      let filteredCats: Categoria[] = []
      if (value) {
        const marcaId = Number(value)
        filteredCats = categorias.filter(c => c.marca_id === marcaId || c.id === 14)
      }
      setCategoriasFiltradas(filteredCats)

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        grupo_descuento_id: "",
        categoria_id: "", // Reset category when brand changes
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    try {
      setSubmitting(true)

      let imageURLToUse = formData.imageURL

      // Upload image if selected
      if (imageFile) {
        try {
          imageURLToUse = await uploadImageToCloudinary(imageFile)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to upload image"
          setError(`Image upload error: ${errorMessage}`)
          setSubmitting(false)
          return
        }
      }

      const response = await fetch("/api/articulos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          imageURL: imageURLToUse,
        }),
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
              Marca <span className="text-red-500">*</span>
            </label>
            <select
              id="marca_id"
              name="marca_id"
              value={formData.marca_id}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Seleccionar marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-2">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            id="categoria_id"
            name="categoria_id"
            value={formData.categoria_id}
            onChange={handleChange}
            disabled={!formData.marca_id}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <option value="">{formData.marca_id ? "Seleccionar categoría" : "Selecciona una marca primero"}</option>
            {categoriasFiltradas.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="grupo_descuento_id" className="block text-sm font-medium text-gray-700 mb-2">
            Grupo Descuento
          </label>
          <select
            id="grupo_descuento_id"
            name="grupo_descuento_id"
            value={formData.grupo_descuento_id}
            onChange={handleChange}
            disabled={!formData.marca_id}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <option value="">{formData.marca_id ? "Seleccionar grupo de descuento (opcional)" : "Selecciona una marca primero"}</option>
            {gruposDescuentoFiltrados.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nombre} ({grupo.descuento}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Media Section */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900">Media</h3>

        {/* Image Upload */}
        <div>
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
            Imagen del Producto
          </label>
          <div className="space-y-3">
            {/* File Input */}
            <div className="relative">
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={submitting}
                className="hidden"
              />
              <label
                htmlFor="imageFile"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {imageFile ? imageFile.name : "Click para seleccionar imagen"}
                </span>
              </label>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <div className="relative w-full max-w-xs">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Remover imagen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Tamaño: {(imageFile?.size || 0) / 1024 / 1024 < 1 ? ((imageFile?.size || 0) / 1024).toFixed(0) : ((imageFile?.size || 0) / 1024 / 1024).toFixed(2)} {(imageFile?.size || 0) / 1024 / 1024 < 1 ? "KB" : "MB"}
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
          <p className="mt-2 text-sm text-gray-500">
            Formatos soportados: JPG, PNG, GIF, WebP. Tamaño máximo: 5MB
          </p>
        </div>

        {/* URL Fallback */}
        <div>
          <label htmlFor="imageURL" className="block text-sm font-medium text-gray-700 mb-2">
            O ingresa una URL (opcional)
          </label>
          <input
            id="imageURL"
            name="imageURL"
            type="url"
            value={formData.imageURL}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={submitting || !!imageFile}
          />
          <p className="mt-1 text-xs text-gray-500">
            {imageFile ? "Desactivo porque ya seleccionaste una imagen" : "Se usará si no subiste una imagen"}
          </p>
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
