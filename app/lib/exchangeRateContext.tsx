"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Currency = "USD" | "ARS";

interface ExchangeRateContextType {
  dollarRate: number | null;
  loading: boolean;
  error: string | null;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertToARS: (usdAmount: number) => number;
  formatPriceARS: (usdAmount: number) => string;
  formatPrice: (usdAmount: number, monedaId: number) => string;
  convertCurrency: (usdAmount: number, monedaId: number) => number;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const [dollarRate, setDollarRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>("ARS");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Sincronizar currency desde localStorage solo después de montar en cliente
    const savedCurrency = localStorage.getItem("selectedCurrency") as Currency | null;
    if (savedCurrency && (savedCurrency === "USD" || savedCurrency === "ARS")) {
      setCurrency(savedCurrency);
    }
    setIsMounted(true);
  }, []);

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

const convertCurrency = (amount: number, monedaId: number): number => {
    if (!dollarRate) return amount;

    // Producto en ARS
    if (monedaId === 1) {
      return currency === "USD"
        ? amount / dollarRate
        : amount;
    }

    // Producto en USD
    if (monedaId === 2) {
      return currency === "ARS"
        ? amount * dollarRate
        : amount;
    }

    return amount;
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

  const formatPrice = (amount: number, monedaId: number): string => {
    const convertedAmount = convertCurrency(
      amount,
      monedaId
    );
      console.log("formatPrice", {
        amount,
        monedaId,
        currency,
        dollarRate
      });
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(convertedAmount);
    }

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    })
      .format(convertedAmount)
      .replace(/^ARS\s/, "AR$ ");
  };

  return (
    <ExchangeRateContext.Provider value={{ dollarRate, loading, error, currency, setCurrency, convertToARS, formatPriceARS, formatPrice, convertCurrency }}>
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