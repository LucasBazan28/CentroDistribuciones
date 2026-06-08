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
 * Fetches a single product by ID directly from Supabase
 */
export async function fetchProductById(id: number): Promise<any> {
  try {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase
      .from("articulos")
      .select(
        "id, referencia, descripcion, precio_unitario, precio_venta, moneda_id, stock, categoria_id, marca_id, grupo_descuento_id, imageURL, observacion, marcas(nombre), grupo_descuento(nombre, descuento), categorias(nombre)"
      )
      .eq("id", id)
      .eq("activo", true)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching product ${id}:`, error)
      return null
    }

    return data || null
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    return null
  }
}

/**
 * Fetches products related to a given product (same category or brand)
 */
export async function fetchRelatedProducts(product: any, limit: number = 4): Promise<any[]> {
  try {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const relatedProducts: any[] = []

    if (product.categoria_id) {
      const { data } = await supabase
        .from("articulos")
        .select(
          "id, referencia, descripcion, precio_unitario, precio_venta, moneda_id, stock, categoria_id, marca_id, grupo_descuento_id, imageURL, observacion, marcas(nombre), grupo_descuento(nombre, descuento), categorias(nombre)"
        )
        .eq("categoria_id", product.categoria_id)
        .eq("activo", true)
        .limit(limit)

      if (data) {
        relatedProducts.push(...data.filter((p: any) => p.id !== product.id))
      }
    }

    if (relatedProducts.length < limit && product.marca_id) {
      const { data } = await supabase
        .from("articulos")
        .select(
          "id, referencia, descripcion, precio_unitario, precio_venta, moneda_id, stock, categoria_id, marca_id, grupo_descuento_id, imageURL, observacion, marcas(nombre), grupo_descuento(nombre, descuento), categorias(nombre)"
        )
        .eq("marca_id", product.marca_id)
        .eq("activo", true)
        .limit(limit)

      if (data) {
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
