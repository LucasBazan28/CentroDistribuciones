"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ExchangeRateContextType {
  dollarRate: number | null;
  loading: boolean;
  error: string | null;
  convertToARS: (usdAmount: number) => number;
  formatPriceARS: (usdAmount: number) => string;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const [dollarRate, setDollarRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDollarRate = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://dolarapi.com/v1/dolares/oficial");
        if (!response.ok) throw new Error("Failed to fetch exchange rate");
        const data = await response.json();
        setDollarRate(data.venta);
        setError(null);
      } catch (err) {
        console.error("Error fetching dollar rate:", err);
        setError(err instanceof Error ? err.message : "Error fetching rate");
        // Fallback a una tasa por defecto si hay error
        setDollarRate(1350);
      } finally {
        setLoading(false);
      }
    };

    fetchDollarRate();
  }, []);

  const convertToARS = (usdAmount: number): number => {
    if (!dollarRate) return usdAmount;
    return usdAmount * dollarRate;
  };

  const formatPriceARS = (usdAmount: number): string => {
    const arsAmount = convertToARS(usdAmount);
    const formatted = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(arsAmount);
    // Replace the default ARS symbol with AR$
    return formatted.replace(/^ARS\s/, "AR$ ");
  };

  return (
    <ExchangeRateContext.Provider value={{ dollarRate, loading, error, convertToARS, formatPriceARS }}>
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRate() {
  const context = useContext(ExchangeRateContext);
  if (!context) {
    throw new Error("useExchangeRate must be used within an ExchangeRateProvider");
  }
  return context;
}
