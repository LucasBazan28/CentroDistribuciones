"use client";

import { useExchangeRate } from "@/app/lib/exchangeRateContext";
import { DollarSign } from "lucide-react";

export default function CurrencySelector() {
  const { currency, setCurrency } = useExchangeRate();

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
      <button
        onClick={() => setCurrency("USD")}
        className={`flex items-center gap-1 px-3 py-1.5 rounded transition-all text-sm font-medium ${
          currency === "USD"
            ? "bg-primary text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        aria-label="Cambiar a USD"
      >
        U$D
      </button>
      <button
        onClick={() => setCurrency("ARS")}
        className={`px-3 py-1.5 rounded transition-all text-sm font-medium ${
          currency === "ARS"
            ? "bg-primary text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        aria-label="Cambiar a ARS"
      >
        AR$
      </button>
    </div>
  );
}
