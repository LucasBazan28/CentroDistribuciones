"use client"

import { Product } from "@/app/lib/types"
import { useCart } from "@/app/lib/cartContext"
import { useExchangeRate } from "@/app/lib/exchangeRateContext"
import { useToast } from "@/app/lib/toastProvider"
import ProductCard from "./ProductCard"

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
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
        <ProductCard
          key={`${index}-${product.id}`}
          product={product}
          onAddToCart={handleAddToCart}
          formatPrice={formatPrice}
        />
      ))}
    </div>
  )
}
