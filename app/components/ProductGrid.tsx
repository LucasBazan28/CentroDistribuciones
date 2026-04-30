"use client"

import { Eye, ShoppingCart } from "lucide-react"
import { Product } from "@/app/lib/types"
import { useCart } from "@/app/lib/cartContext"
import { useExchangeRate } from "@/app/lib/exchangeRateContext"
import { useToast } from "@/app/lib/toastProvider"

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
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

export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  const { addItem } = useCart();
  const { formatPrice } = useExchangeRate();
  const { addToast } = useToast();

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    addToast(`${product.referencia} agregado al carrito`, "success");
  };
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-100 h-80 animate-pulse" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16 px-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay productos que coincidan
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros o términos de búsqueda
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <div
          key={`${index}-${product.id}`}
          className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          {/* Product image placeholder */}
          <div
            className={`relative flex h-48 items-center justify-center ${getGradientForProduct(
              product.id
            )}`}
          >
            <span className="text-4xl font-light text-gray-300">
              {product.categorias?.nombre?.charAt(0) || "P"}
            </span>
            <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                className="rounded-full bg-white p-2 shadow-md transition-colors hover:bg-primary hover:text-white"
                aria-label="Ver detalle"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleAddToCart(product)}
                className="rounded-full bg-white p-2 shadow-md transition-colors hover:bg-primary hover:text-white"
                aria-label="Agregar al carrito"
              >
                <ShoppingCart size={16} />
              </button>
            </div>
          </div>

          <div className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {product.categorias?.nombre || "Sin categoría"}
            </span>
            <h3 className="mt-1.5 text-sm font-semibold leading-snug text-gray-800 line-clamp-2">
              {product.referencia} - {product.descripcion}
            </h3>

            {/* Brand Info */}
            {product.marcas && (
              <p className="mt-1 text-xs text-gray-500">
                {product.marcas.nombre}
              </p>
            )}

            <div className="mt-3 flex flex-col gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.precio_venta)}
              </span>
              <button className="w-full rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white">
                Ver más
              </button>
            </div>

            {/* Stock indicator */}
            {product.stock === 0 && (
              <div className="mt-2 rounded bg-red-50 px-2 py-1 text-center">
                <span className="text-xs font-semibold text-red-600">Agotado</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
