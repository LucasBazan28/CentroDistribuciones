"use client";

import { Eye, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Product } from "@/app/lib/types";
import { useCart } from "@/app/lib/cartContext";
import { useExchangeRate } from "@/app/lib/exchangeRateContext";
import { useToast } from "@/app/lib/toastProvider";
import Link from "next/link";

const gradients = [
  "bg-gradient-to-br from-blue-100 to-blue-200",
  "bg-gradient-to-br from-green-100 to-green-200",
  "bg-gradient-to-br from-amber-100 to-amber-200",
  "bg-gradient-to-br from-red-100 to-red-200",
  "bg-gradient-to-br from-purple-100 to-purple-200",
  "bg-gradient-to-br from-cyan-100 to-cyan-200",
  "bg-gradient-to-br from-gray-100 to-gray-200",
  "bg-gradient-to-br from-yellow-100 to-yellow-200",
];

function getGradientForProduct(id: number): string {
  return gradients[id % gradients.length];
}

interface FeaturedProductsListProps {
  products: Product[];
}

export default function FeaturedProductsList({ products }: FeaturedProductsListProps) {
  const { addItem } = useCart();
  const { formatPrice } = useExchangeRate();
  const { addToast } = useToast();

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    addToast(`${product.referencia} agregado al carrito`, "success");
  };

  return (
    <>
      {products.map((product) => (
        <div
          key={product.id}
          className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          {/* Product image */}
          <div
            className={`relative h-48 overflow-hidden ${getGradientForProduct(
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
              <div className="flex h-full items-center justify-center">
                <span className="text-4xl font-light text-gray-300">P</span>
              </div>
            )}
            <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
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
            <div className="mt-3 flex flex-col gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.precio_venta)}
              </span>
              <Link href={`/products/${product.id}`} className="w-full rounded-lg bg-primary/10 px-3 py-1.5 text-center text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white">
                Ver más
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
