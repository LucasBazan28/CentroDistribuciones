"use client"

import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import SearchBar from "@/app/components/SearchBar"
import FilterPanel, { FilterState } from "@/app/components/FilterPanel"
import ProductGrid from "@/app/components/ProductGrid"
import { useExchangeRate } from "@/app/lib/exchangeRateContext"

import { ChevronUp, Loader } from "lucide-react"
import { fetchAllProducts, extractFilters } from "@/app/lib/productHelpers"
import { Product, Category, Brand } from "@/app/lib/types"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const { convertToARS } = useExchangeRate()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    minPrice: "",
    maxPrice: "",
    currency: "USD",
  })
  const [currentPage, setCurrentPage] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const itemsPerPage = 60

  // Load all products on mount
  useEffect(() => {
    setIsLoadingAll(true)

    const loadProducts = async () => {
      // Get search term from URL first
      const searchParam = searchParams.get("search")
      if (searchParam !== null) {
        setSearchTerm(searchParam)
      }

      // Pass search term to fetch function
      const products = await fetchAllProducts((products) => {
        // Update UI with progress
        setAllProducts(products)
        const { categories, brands } = extractFilters(products)
        setCategories(categories)
        setBrands(brands)
      }, searchParam || undefined)

      // After all products are loaded, apply URL filters if present
      const brandParam = searchParams.get("brand")
      const categoryParam = searchParams.get("category")

      if (products.length > 0) {
        const { brands: extractedBrands, categories: extractedCategories } = extractFilters(products)

        if (brandParam) {
          const matchingBrand = extractedBrands.find(
            (b) => b.nombre.toLowerCase() === brandParam.toLowerCase()
          )
          if (matchingBrand) {
            setFilters((prev) => ({
              ...prev,
              brands: [matchingBrand.id.toString()],
            }))
          }
        }

        if (categoryParam) {
          const matchingCategory = extractedCategories.find(
            (c) => c.nombre.toLowerCase() === categoryParam.toLowerCase()
          )
          if (matchingCategory) {
            setFilters((prev) => ({
              ...prev,
              categories: [matchingCategory.id.toString()],
            }))
          }
        }
      }

      setIsLoadingAll(false)
    }

    loadProducts()
  }, [searchParams])

  // Refetch products when search term changes (with debounce)
  useEffect(() => {
    setIsLoadingAll(true)

    const timer = setTimeout(async () => {
      const products = await fetchAllProducts((products) => {
        setAllProducts(products)
        const { categories, brands } = extractFilters(products)
        setCategories(categories)
        setBrands(brands)
      }, searchTerm || undefined)

      setIsLoadingAll(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Filter and search products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = [
          product.referencia,
          product.descripcion,
          product.marcas?.nombre || "",
          product.categorias?.nombre || "",
        ].some((field) => field.toLowerCase().includes(searchLower))

        if (!matchesSearch) return false
      }

      // Category filter - show all if no categories selected
      if (filters.categories.length > 0 && (!product.categoria_id || !filters.categories.includes(product.categoria_id.toString()))) {
        return false
      }

      // Brand filter - show all if no brands selected
      if (filters.brands.length > 0 && (!product.marca_id || !filters.brands.includes(product.marca_id.toString()))) {
        return false
      }

      // Price filters
      const priceToCompare = filters.currency === "ARS"
        ? convertToARS(product.precio_venta)
        : product.precio_venta

      if (filters.minPrice && priceToCompare < parseInt(filters.minPrice)) {
        return false
      }

      if (filters.maxPrice && priceToCompare > parseInt(filters.maxPrice)) {
        return false
      }

      return true
    })
  }, [allProducts, searchTerm, filters])

  // Paginate filtered products
  const paginatedProducts = useMemo(() => {
    const start = currentPage * itemsPerPage
    const end = start + itemsPerPage
    return filteredProducts.slice(start, end)
  }, [filteredProducts, currentPage])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  // Reset pagination when filters/search changes
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm, filters])

  // Handle scroll to show scroll-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      minPrice: "",
      maxPrice: "",
      currency: "USD",
    })
    setSearchTerm("")
    setCurrentPage(0)
  }

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Catálogo de Productos
          </h1>
          <p className="mt-2 text-gray-600">
            Explora nuestro completo catálogo de material eléctrico e industrial
          </p>
          {!isLoadingAll && allProducts.length > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Total: <span className="font-semibold">{allProducts.length}</span> productos
            </p>
          )}
        </div>
        {/* Main Layout - Filters and Products */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar - Filters */}
          <aside className="w-full lg:w-64 lg:shrink-0">
            <FilterPanel
              categories={categories}
              brands={brands}
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Main Content - Products Grid */}
          <div className="flex-1">
            {/* Results count and loading indicator */}
            {filteredProducts.length > 0 && (
              <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                <div>
                  Se encontraron <span className="font-semibold">{filteredProducts.length}</span> productos
                  {isLoadingAll && 
                    <div>
                      <span className="ml-2 text-gray-500">(Cargando todos...)</span>
                      <Loader className="ml-2 inline-block animate-spin text-gray-400" size={16} />
                    </div>
                  }
                </div>
                {totalPages > 1 && (
                  <div className="text-xs text-gray-500">
                    Página {currentPage + 1} de {totalPages}
                  </div>
                )}
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid products={paginatedProducts} isLoading={isLoadingAll && allProducts.length === 0} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  className="rounded-lg border border-gray-200 px-6 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>

                <div className="text-sm text-gray-600">
                  Página <span className="font-semibold">{currentPage + 1}</span> de{" "}
                  <span className="font-semibold">{totalPages}</span>
                </div>

                <button
                  onClick={handleLoadMore}
                  disabled={currentPage >= totalPages - 1}
                  className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            )}

            {/* Loading indicator for background fetch */}
            {isLoadingAll && allProducts.length > 0 && (
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-center text-xs text-blue-700">
                <Loader className="inline-block animate-spin text-gray-400" size={16} />
                <span className="ml-2">Cargando más productos en segundo plano...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary-dark hover:scale-110 active:scale-95"
          aria-label="Ir al inicio"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </main>
  )
}
