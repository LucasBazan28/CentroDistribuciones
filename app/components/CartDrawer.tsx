"use client";

import { useCart } from "@/app/lib/cartContext";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2 } from "lucide-react";

interface CartDrawerProps {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProps) {
  const router = useRouter();
  const { state: cartState, removeItem, updateQuantity } = useCart();

  const subtotal = cartState.items.reduce((sum, item) => sum + item.precio_venta * item.quantity, 0);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleNavigateToCart = () => {
    router.push("/cart");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Carrito</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartState.items.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <p className="text-gray-600 mb-2">Tu carrito está vacío</p>
                <button
                  onClick={() => {
                    router.push("/products");
                    onClose();
                  }}
                  className="text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  Seguir comprando →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cartState.items.map((item) => (
                <div key={item.id} className="flex gap-3 border-b border-gray-100 pb-4">
                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {item.referencia}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.descripcion}</p>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {formatPrice(item.precio_venta)}
                    </p>
                  </div>

                  {/* Quantity and remove */}
                  <div className="flex flex-col items-end gap-2">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        className="p-1 text-gray-600 hover:bg-gray-100"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:bg-gray-100"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                      aria-label="Eliminar del carrito"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartState.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(subtotal)}</span>
            </div>

            {/* Buttons */}
            <button
              onClick={handleNavigateToCart}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Ver carrito completo
            </button>
            <button
              onClick={() => {
                router.push("/cart?quote=true");
                onClose();
              }}
              className="w-full rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Solicitar Presupuesto
            </button>
          </div>
        )}
      </div>
    </>
  );
}
