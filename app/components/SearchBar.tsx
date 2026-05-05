"use client"

import { Search, X } from "lucide-react"
import { useEffect, useState } from "react"

interface SearchBarProps {
  onSearch: (searchTerm: string) => void
  placeholder?: string
  compact?: boolean
  initialValue?: string
}

export default function SearchBar({ onSearch, placeholder = "Buscar productos por referencia, descripción o marca...", compact = false, initialValue = "" }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue)

  useEffect(() => {
    setSearchTerm(initialValue)
  }, [initialValue])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch])

  const handleClear = () => {
    setSearchTerm("")
  }

  return (
    <div className={compact ? "w-full" : "mb-8 w-full"}>
      <div className="relative">
        <Search className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 ${compact ? "left-3" : "left-4"}`} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-500 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            compact
              ? "px-10 py-2 text-sm"
              : "pl-12 pr-12 py-3"
          }`}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 ${compact ? "right-3" : "right-4"}`}
            aria-label="Limpiar búsqueda"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
