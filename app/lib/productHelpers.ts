/**
 * Fetches all active products from the API using chunking
 * First chunk: 60 products (for quick initial display)
 * Subsequent chunks: 300 products (for efficient bulk loading)
 */
export async function fetchAllProducts(onProgress?: (products: any[]) => void, searchTerm?: string) {
  try {
    let allProducts: any[] = []
    let offset = 0
    let isFirstChunk = true
    const chunkLog: any[] = []

    while (true) {
      // First chunk is 60 to show results quickly, subsequent chunks are 300
      const pageSize = isFirstChunk ? 60 : 300
      isFirstChunk = false

      const params = new URLSearchParams()
      params.set("public", "true")
      params.set("offset", offset.toString())
      params.set("limit", pageSize.toString())
      if (searchTerm?.trim()) {
        params.set("search", searchTerm)
      }

      const response = await fetch(`/api/articulos?${params.toString()}`)
      if (!response.ok) throw new Error("Error fetching products")

      const chunk = await response.json()
      if (!chunk || chunk.length === 0) break

      // Debug: log chunk info
      const chunk1401Count = chunk.filter((p: any) => p.id === 1401).length
      chunkLog.push({
        offset,
        limit: pageSize,
        chunkSize: chunk.length,
        product1401InChunk: chunk1401Count > 0,
        product1401Count: chunk1401Count
      })

      allProducts = [...allProducts, ...chunk]

      // Call progress callback to update UI with newly loaded products
      if (onProgress) {
        onProgress(allProducts)
      }

      // If chunk is smaller than page size, we've reached the end
      if (chunk.length < pageSize) {
        break
      }

      offset += pageSize
    }

    return allProducts
  } catch (error) {
    console.error("Error fetching all products:", error)
    return []
  }
}

/**
 * Fetches a single product by ID from the public API
 */
export async function fetchProductById(id: number) {
  try {
    const response = await fetch(`/api/articulos/${id}?public=true`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch product: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    return null
  }
}

/**
 * Fetches products related to a given product (same category or brand)
 */
export async function fetchRelatedProducts(product: any, limit: number = 4) {
  try {
    const relatedProducts: any[] = []

    // Fetch products from same category
    if (product.categoria_id) {
      const response = await fetch(
        `/api/articulos?public=true&category=${product.categoria_id}&limit=${limit}`
      )
      if (response.ok) {
        const data = await response.json()
        relatedProducts.push(...data.filter((p: any) => p.id !== product.id))
      }
    }

    // If we don't have enough, try to fetch from same brand
    if (relatedProducts.length < limit && product.marca_id) {
      const response = await fetch(
        `/api/articulos?public=true&brand=${product.marca_id}&limit=${limit}`
      )
      if (response.ok) {
        const data = await response.json()
        data.forEach((p: any) => {
          if (p.id !== product.id && !relatedProducts.find((rp) => rp.id === p.id)) {
            relatedProducts.push(p)
          }
        })
      }
    }

    return relatedProducts.slice(0, limit)
  } catch (error) {
    console.error("Error fetching related products:", error)
    return []
  }
}

/**
 * Extracts unique categories and brands from a list of products
 */
export function extractFilters(products: any[]) {
  const categoriesMap = new Map<number, string>()
  const brandsMap = new Map<number, string>()

  products.forEach((product) => {
    if (product.categorias?.nombre && product.categoria_id) {
      categoriesMap.set(product.categoria_id, product.categorias.nombre)
    }
    if (product.marcas?.nombre && product.marca_id) {
      brandsMap.set(product.marca_id, product.marcas.nombre)
    }
  })

  const categories = Array.from(categoriesMap.entries())
    .map(([id, nombre]) => ({ id, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  const brands = Array.from(brandsMap.entries())
    .map(([id, nombre]) => ({ id, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  return { categories, brands }
}
