"use client"

import { ChevronDown, ChevronRight, X } from "lucide-react"
import { useState } from "react"

export interface FilterState {
  categories: string[]
  brands: string[]
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

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId]
    onFilterChange({
      ...filters,
      categories: newCategories,
    })
  }

  const handleClearCategories = () => {
    onFilterChange({
      ...filters,
      categories: [],
    })
  }

  const handleBrandChange = (brandId: string) => {
    const newBrands = filters.brands.includes(brandId)
      ? filters.brands.filter((id) => id !== brandId)
      : [...filters.brands, brandId]
    onFilterChange({
      ...filters,
      brands: newBrands,
    })
  }

  const handleClearBrands = () => {
    onFilterChange({
      ...filters,
      brands: [],
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

  const hasActiveFilters = filters.categories.length > 0 || filters.brands.length > 0 || filters.minPrice || filters.maxPrice || filters.currency !== "USD"

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
            {filters.categories.length > 0 && (
              <button
                onClick={handleClearCategories}
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors mb-2 block"
              >
                Limpiar selección
              </button>
            )}
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat.id.toString())}
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
            {filters.brands.length > 0 && (
              <button
                onClick={handleClearBrands}
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors mb-2 block"
              >
                Limpiar selección
              </button>
            )}
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.id.toString())}
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
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Rango de Precio</h4>
        <div className="space-y-3">
          {/* Currency selector */}
          <div className="mb-4 pb-3 border-b border-gray-100 flex gap-2">
            <button
              onClick={() => handleCurrencyChange("ARS")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                filters.currency === "ARS"
                  ? "bg-primary text-white"
                  : "border border-gray-200 text-gray-700 hover:border-primary"
              }`}
            >
              AR$
            </button>
            <button
              onClick={() => handleCurrencyChange("USD")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                filters.currency === "USD"
                  ? "bg-primary text-white"
                  : "border border-gray-200 text-gray-700 hover:border-primary"
              }`}
            >
              U$D
            </button>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handlePriceChange("minPrice", e.target.value)}
              placeholder="Mínimo"
              className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
              placeholder="Máximo"
              className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
