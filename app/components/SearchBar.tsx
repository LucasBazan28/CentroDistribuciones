"use client"

import { Search, X } from "lucide-react"
import { useEffect, useState } from "react"

interface SearchBarProps {
  onSearch: (searchTerm: string) => void
  placeholder?: string
  compact?: boolean
  initialValue?: string
  autoSearch?: boolean
}

export default function SearchBar({ onSearch, placeholder = "Buscar productos por referencia, descripción o marca...", compact = false, initialValue = "", autoSearch = true }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue)

  useEffect(() => {
    setSearchTerm(initialValue)
  }, [initialValue])

  // Auto-search with debounce (only if autoSearch is true)
  useEffect(() => {
    if (!autoSearch) return

    const timer = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch, autoSearch])

  const handleClear = () => {
    setSearchTerm("")
  }

  const handleSearchClick = () => {
    onSearch(searchTerm)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !autoSearch) {
      onSearch(searchTerm)
    }
  }

  return (
    <div className={compact ? "w-full" : "mb-8 w-full"}>
      <div className="relative">
        <button
          onClick={handleSearchClick}
          className={`absolute top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-primary ${autoSearch ? "cursor-default hover:text-gray-400" : "cursor-pointer"} ${compact ? "left-3" : "left-4"}`}
          aria-label="Buscar"
          type="button"
          disabled={autoSearch}
        >
          <Search className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
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
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
