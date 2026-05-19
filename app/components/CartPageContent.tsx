"use client";

import { useCart } from "@/app/lib/cartContext";
import { useExchangeRate } from "@/app/lib/exchangeRateContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import QuoteRequestForm from "@/app/components/QuoteRequestForm";

export default function CartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state: cartState, removeItem, updateQuantity, clearCart } = useCart();
  const { convertCurrency, currency } = useExchangeRate();
  const [showQuoteForm, setShowQuoteForm] = useState(searchParams.get("quote") === "true");
  const quoteFormRef = useRef<HTMLDivElement>(null);

  // Scroll to quote form when it becomes visible
  useEffect(() => {
    if (showQuoteForm && quoteFormRef.current) {
      setTimeout(() => {
        quoteFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showQuoteForm]);

  const subtotalUSD = cartState.items.reduce((sum, item) => sum + item.precio_venta * item.quantity, 0);
  const subtotal = convertCurrency(subtotalUSD);
  const iva = subtotal * 0.21;
  const total = subtotal + iva;

  const formatPrice = (price: number): string => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(price);
    } else {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
      }).format(price);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg hover:bg-gray-200 p-2 transition-colors"
            aria-label="Volver atrás"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Carrito de Compras</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {cartState.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 px-4">
                <p className="mb-4 text-lg text-gray-600">Tu carrito está vacío</p>
                <button
                  onClick={() => router.push("/products")}
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Seguir comprando
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartState.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:gap-6 sm:p-6"
                  >
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                        {item.referencia}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 sm:text-sm line-clamp-2">
                        {item.descripcion}
                      </p>
                      {item.marcas && (
                        <p className="mt-1 text-xs text-gray-500">{item.marcas.nombre}</p>
                      )}
                      <p className="mt-2 text-base font-bold text-gray-900 sm:text-lg">
                        {formatPrice(convertCurrency(item.precio_venta))}
                      </p>
                    </div>

                    {/* Quantity and remove */}
                    <div className="flex flex-col items-end gap-3 sm:gap-4">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Remove and subtotal */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-600 transition-colors font-medium sm:text-sm"
                        >
                          Eliminar
                        </button>
                        <p className="text-xs text-gray-500 sm:text-sm">
                          Subtotal: {formatPrice(convertCurrency(item.precio_venta * item.quantity))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear cart button */}
                <button
                  onClick={() => {
                    if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
                      clearCart();
                    }
                  }}
                  className="w-full rounded-lg border border-red-500 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {cartState.items.length > 0 && (
            <div className={`rounded-lg border border-gray-200 bg-white p-6 sticky top-24 ${showQuoteForm ? "" : "h-fit"}`}>
              {!showQuoteForm ? (
                <>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen</h2>

                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">IVA (21%):</span>
                      <span className="font-semibold text-gray-900">{formatPrice(iva)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="font-bold text-lg text-primary">{formatPrice(total)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      {cartState.items.length} {cartState.items.length === 1 ? "producto" : "productos"}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowQuoteForm(true)}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark mb-3"
                  >
                    Solicitar Presupuesto
                  </button>

                  <button
                    onClick={() => router.push("/products")}
                    className="w-full rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    Seguir comprando
                  </button>
                </>
              ) : (
                <div ref={quoteFormRef}>
                  <button
                    onClick={() => setShowQuoteForm(false)}
                    className="mb-4 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    ← Volver al resumen
                  </button>
                  <QuoteRequestForm
                    cartItems={cartState.items}
                    onClose={() => setShowQuoteForm(false)}
                    onSuccess={() => {
                      clearCart();
                      setShowQuoteForm(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
