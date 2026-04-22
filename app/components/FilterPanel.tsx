"use client"

import { ChevronDown, X } from "lucide-react"
import { useState } from "react"

export interface FilterState {
  category: string | null
  brand: string | null
  minPrice: string
  maxPrice: string
  currency: "USD" | "ARS"
}

interface FilterPanelProps {
  categories: Array<{ id: number; nombre: string }>
  brands: Array<{ id: number; nombre: string }>
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onClearFilters: () => void
}

export default function FilterPanel({
  categories,
  brands,
  filters,
  onFilterChange,
  onClearFilters,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleCategoryChange = (categoryId: string | null) => {
    onFilterChange({
      ...filters,
      category: categoryId,
    })
  }

  const handleBrandChange = (brandId: string | null) => {
    onFilterChange({
      ...filters,
      brand: brandId,
    })
  }

  const handlePriceChange = (field: "minPrice" | "maxPrice", value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    })
  }

  const handleCurrencyChange = (currency: "USD" | "ARS") => {
    onFilterChange({
      ...filters,
      currency,
      minPrice: "",
      maxPrice: "",
    })
  }

  const hasActiveFilters = filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.currency !== "USD"

  return (
    <div className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="mb-6 border-b border-gray-100 pb-6">
        <button
          onClick={() => toggleSection("category")}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
        >
          Categoría
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              expandedSections.category ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.category && (
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={!filters.category}
                onChange={() => handleCategoryChange(null)}
                className="h-4 w-4 rounded border-gray-300 text-primary"
              />
              <span className="text-sm text-gray-600">Todas</span>
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  checked={filters.category === cat.id.toString()}
                  onChange={() => handleCategoryChange(cat.id.toString())}
                  className="h-4 w-4 rounded border-gray-300 text-primary"
                />
                <span className="text-sm text-gray-600">{cat.nombre}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands Filter */}
      <div className="mb-6 border-b border-gray-100 pb-6">
        <button
          onClick={() => toggleSection("brand")}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
        >
          Marca
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              expandedSections.brand ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.brand && (
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="brand"
                checked={!filters.brand}
                onChange={() => handleBrandChange(null)}
                className="h-4 w-4 rounded border-gray-300 text-primary"
              />
              <span className="text-sm text-gray-600">Todas</span>
            </label>
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  value={brand.id}
                  checked={filters.brand === brand.id.toString()}
                  onChange={() => handleBrandChange(brand.id.toString())}
                  className="h-4 w-4 rounded border-gray-300 text-primary"
                />
                <span className="text-sm text-gray-600">{brand.nombre}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div>
        <button
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
        >
          Rango de Precio
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              expandedSections.price ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.price && (
          <div className="mt-4 space-y-3">
            {/* Currency selector */}
            <div className="mb-4 pb-3 border-b border-gray-100">
              <label className="text-xs font-semibold text-gray-700 block mb-2">Moneda</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCurrencyChange("USD")}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    filters.currency === "USD"
                      ? "bg-primary text-white"
                      : "border border-gray-200 text-gray-700 hover:border-primary"
                  }`}
                >
                  USD
                </button>
                <button
                  onClick={() => handleCurrencyChange("ARS")}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    filters.currency === "ARS"
                      ? "bg-primary text-white"
                      : "border border-gray-200 text-gray-700 hover:border-primary"
                  }`}
                >
                  ARS
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Mínimo</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                placeholder="$0"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Máximo</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                placeholder="Sin límite"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
