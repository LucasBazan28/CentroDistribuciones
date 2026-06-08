"use client"

import { ShoppingCart } from "lucide-react"
import { useState } from "react"
import { Product } from "@/app/lib/types"
import { useCart } from "@/app/lib/cartContext"
import { useExchangeRate } from "@/app/lib/exchangeRateContext"
import { useToast } from "@/app/lib/toastProvider"

interface ProductDetailsProps {
  product: Product
}

const gradients = [
  "bg-gradient-to-br from-blue-100 to-blue-200",
  "bg-gradient-to-br from-green-100 to-green-200",
  "bg-gradient-to-br from-amber-100 to-amber-200",
  "bg-gradient-to-br from-red-100 to-red-200",
  "bg-gradient-to-br from-purple-100 to-purple-200",
  "bg-gradient-to-br from-cyan-100 to-cyan-200",
  "bg-gradient-to-br from-gray-100 to-gray-200",
  "bg-gradient-to-br from-yellow-100 to-yellow-200",
]

function getGradientForProduct(id: number): string {
  return gradients[id % gradients.length]
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useCart()
  const { formatPrice } = useExchangeRate()
  const { addToast } = useToast()
  const [showOutOfStockWarning, setShowOutOfStockWarning] = useState(false)

  const isOutOfStock = product.stock === 0
 
  const precioSinIVA = product.precio_venta / (1 + (product.iva || 21) / 100)

  const handleAddToCartClick = () => {
    if (isOutOfStock) {
      setShowOutOfStockWarning(true)
    } else {
      addItem(product, 1)
      addToast(`${product.referencia} agregado al carrito`, "success")
    }
  }

  const handleConfirmAddToCart = () => {
    addItem(product, 1)
    addToast(`${product.referencia} agregado al carrito`, "success")
    setShowOutOfStockWarning(false)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Product Image */}
      <div className="flex items-center justify-center">
        <div
          className={`relative aspect-square w-full overflow-hidden rounded-2xl ${getGradientForProduct(
            product.id
          )}`}
        >
          {product.imageURL ? (
            <img
              src={product.imageURL}
              alt={product.referencia}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-8xl font-light text-gray-300">P</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            {product.categorias?.nombre || "Sin categoría"}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {product.referencia}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {product.descripcion}
          </p>
        </div>

        {/* Brand and Category */}
        <div className="grid gap-4 border-y border-gray-200 py-4 sm:grid-cols-2">
          {product.marcas && (
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Marca</p>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {product.marcas.nombre}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Categoría</p>
            <p className="mt-1 text-base font-semibold text-gray-900">
              {product.categorias?.nombre || "Sin categoría"}
            </p>
          </div>
        </div>

        {/* Price and Stock */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="mb-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600">Precio (con IVA)</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatPrice(product.precio_venta, product.moneda_id)}
              </p>
            </div>
          <div>
            <p className="text-sm text-gray-600">Precio sin impuestos</p>
            <p className="text-2xl font-semibold text-gray-700">
              {isNaN(precioSinIVA) ? "N/A" : formatPrice(precioSinIVA, product.moneda_id)}
            </p>
          </div>
          </div>
        </div>

        {/* Observation */}
        {product.observacion && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">Observación</p>
            <p className="mt-2 text-sm text-blue-800">
              {product.observacion}
            </p>
          </div>
        )}

        {/* Price and Stock */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          {/* Stock Status */}
          <div className={`rounded-lg p-3 ${
            isOutOfStock
              ? "border border-red-200 bg-red-50"
              : product.stock <= 5
              ? "border border-yellow-200 bg-yellow-50"
              : "border border-green-200 bg-green-50"
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${
                isOutOfStock
                  ? "text-red-900"
                  : product.stock <= 5
                  ? "text-yellow-900"
                  : "text-green-900"
              }`}>
                {isOutOfStock
                  ? "Agotado"
                  : product.stock <= 5
                  ? "Stock limitado"
                  : "En stock"}
              </span>
              <span className={`font-bold ${
                isOutOfStock
                  ? "text-red-600"
                  : product.stock <= 5
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}>
                {product.stock} {product.stock === 1 ? "unidad" : "unidades"}
              </span>
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCartClick}
          className={`flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all ${
            isOutOfStock
              ? "bg-orange-500 hover:bg-orange-600 active:scale-95"
              : "bg-primary hover:bg-primary-dark active:scale-95"
          }`}
        >
          <ShoppingCart size={20} />
          {isOutOfStock ? "Agregar al carrito" : "Agregar al carrito"}
        </button>

        {/* Additional Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-gray-600">
            Información Adicional
          </p>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-semibold">ID:</span> {product.id}
            </p>
            <p>
              <span className="font-semibold">Referencia:</span> {product.referencia}
            </p>
            <p>
              <span className="font-semibold">Stock Disponible:</span> {product.stock} unidades
            </p>
          </div>
        </div>
      </div>

      {/* Out of Stock Warning Modal */}
      {showOutOfStockWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Producto sin stock</h2>
            <p className="mb-6 text-gray-600">Actualmente no hay stock del producto</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOutOfStockWarning(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-all hover:bg-primary-dark active:scale-95"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
