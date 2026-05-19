"use client";

import { useState } from "react";
import { CartItem } from "@/app/lib/cartContext";
import { useExchangeRate } from "@/app/lib/exchangeRateContext";
import { useToast } from "@/app/lib/toastProvider";
import { Loader } from "lucide-react";

interface QuoteRequestFormProps {
  cartItems: CartItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuoteRequestForm({ cartItems, onClose, onSuccess }: QuoteRequestFormProps) {
  const { addToast } = useToast();
  const { convertToARS } = useExchangeRate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Validar nombre: solo letras y espacios
    if (name === "nombre") {
      const filtered = value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: filtered }));
      return;
    }

    // Validar teléfono: solo números, +, - y espacios
    if (name === "telefono") {
      const filtered = value.replace(/[^0-9+\-\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: filtered }));
      return;
    }

    // Otros campos sin restricción
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: cartItems,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar presupuesto");
      }

      addToast("Presupuesto enviado exitosamente", "success");
      onSuccess();
    } catch (error) {
      console.error("Error submitting quote:", error);
      addToast(
        error instanceof Error ? error.message : "Error al enviar presupuesto",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const subtotalUSD = cartItems.reduce((sum, item) => sum + item.precio_venta * item.quantity, 0);
  const subtotal = convertToARS(subtotalUSD);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Solicitar Presupuesto</h2>

      {/* Items summary */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-2">Artículos en el presupuesto:</p>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {item.referencia} x {item.quantity}
              </span>
              <span className="text-gray-900 font-medium">
                {formatPrice(convertToARS(item.precio_venta * item.quantity))}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between font-bold text-gray-900">
          <span>Total:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1.5">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="+54-9-291-643-1275"
          />
        </div>

        <div>
          <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1.5">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Información adicional o notas sobre tu presupuesto..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader size={16} className="animate-spin" />}
            {loading ? "Enviando..." : "Enviar Presupuesto"}
          </button>
        </div>
      </form>
    </div>
  );
}