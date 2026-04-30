import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile || profile.rol !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can create products" }, { status: 403 })
    }

    const body = await request.json()
    const {
      referencia,
      cc,
      descripcion,
      embalaje,
      precio_unitario,
      moneda_id,
      stock_minimo = 0,
      stock = 0,
      observacion,
      marca_id,
      grupo_descuento_id,
      categoria_id,
      activo,
      imageURL,
    } = body

    // Validate required fields
    if (!referencia || !cc || !descripcion || !embalaje || precio_unitario === undefined || !moneda_id || !grupo_descuento_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (precio_unitario < 0) {
      return NextResponse.json(
        { error: "Precio unitario cannot be negative" },
        { status: 400 }
      )
    }

    if (stock_minimo < 0) {
      return NextResponse.json(
        { error: "Stock mínimo cannot be negative" },
        { status: 400 }
      )
    }

    if (stock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      )
    }

    // Insert into database
    const { data, error } = await supabase
      .from("articulos")
      .insert([
        {
          referencia,
          cc,
          descripcion,
          embalaje,
          precio_unitario: parseFloat(precio_unitario),
          moneda_id: parseInt(moneda_id),
          stock_minimo: parseInt(stock_minimo),
          stock: parseInt(stock),
          observacion: observacion || null,
          marca_id: marca_id ? parseInt(marca_id) : null,
          grupo_descuento_id: parseInt(grupo_descuento_id),
          categoria_id: categoria_id ? parseInt(categoria_id) : null,
          imageURL: imageURL || null,
          ...(activo !== undefined && { activo }),
        },
      ])
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create product" },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      )
    }

    // Fetch the complete product with relations
    const { data: completeData, error: fetchError } = await supabase
      .from("articulos")
      .select("*, marcas(nombre), grupo_descuento(nombre), categorias(nombre)")
      .eq("id", data[0].id)
      .maybeSingle()

    if (fetchError || !completeData) {
      console.error("Fetch error:", fetchError)
      return NextResponse.json(
        { error: "Failed to fetch created product" },
        { status: 500 }
      )
    }

    return NextResponse.json(completeData, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    // Check if this is a public browse request
    const isPublic = searchParams.get("public") === "true"

    if (!isPublic) {
      // Original admin-only endpoint
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { data: profile, error: profileError } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError || !profile || profile.rol !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // Check for marca_id filter
      const marcaId = searchParams.get("marca_id") ? parseInt(searchParams.get("marca_id")!) : null

      let query = supabase
        .from("articulos")
        .select("*, marcas(nombre), grupo_descuento(nombre), categorias(nombre)")
        .order("created_at", { ascending: false })

      if (marcaId) {
        query = query.eq("marca_id", marcaId)
      }

      const { data, error } = await query

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json(data)
    }

    // Public browse endpoint
    const search = searchParams.get("search")?.toLowerCase() || ""
    const category = searchParams.get("category")
    const brand = searchParams.get("brand")
    const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : null
    const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0
    const limit = Math.min(parseInt(searchParams.get("limit") || "60"), 500)

    let query = supabase
      .from("articulos")
      .select("id, referencia, descripcion, precio_unitario, precio_venta, stock, categoria_id, marca_id, grupo_descuento_id", { count: "exact" })
      .eq("activo", true)

    // Apply filters
    if (category) {
      query = query.eq("categoria_id", parseInt(category))
    }

    if (brand) {
      query = query.eq("marca_id", parseInt(brand))
    }

    if (minPrice !== null) {
      query = query.gte("precio_venta", minPrice)
    }

    if (maxPrice !== null) {
      query = query.lte("precio_venta", maxPrice)
    }

    const { data: allData, error } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Apply search filter if provided
    let filteredData = allData || []
    if (search) {
      filteredData = filteredData.filter((item: any) => {
        const searchFields = [
          item.referencia,
          item.descripcion,
        ]
        return searchFields.some((field: string) =>
          field.toLowerCase().includes(search)
        )
      })
    }

    // Fetch relations separately to avoid JOIN issues
    const marcasMap = new Map()
    const categoriasMap = new Map()
    const grupoDescuentoMap = new Map()

    const uniqueMarcaIds = [...new Set(filteredData.map(p => p.marca_id))]
    const uniqueCategoriaIds = [...new Set(filteredData.map(p => p.categoria_id))]
    const uniqueGrupoDescuentoIds = [...new Set(filteredData.map(p => p.grupo_descuento_id))]

    if (uniqueMarcaIds.length > 0) {
      const { data: marcas } = await supabase
        .from("marcas")
        .select("id, nombre")
        .in("id", uniqueMarcaIds)
      marcas?.forEach(m => marcasMap.set(m.id, m))
    }

    if (uniqueCategoriaIds.length > 0) {
      const { data: categorias } = await supabase
        .from("categorias")
        .select("id, nombre")
        .in("id", uniqueCategoriaIds)
      categorias?.forEach(c => categoriasMap.set(c.id, c))
    }

    if (uniqueGrupoDescuentoIds.length > 0) {
      const { data: grupoDescuento } = await supabase
        .from("grupo_descuento")
        .select("id, nombre, descuento")
        .in("id", uniqueGrupoDescuentoIds)
      grupoDescuento?.forEach(g => grupoDescuentoMap.set(g.id, g))
    }

    // Merge relations into data
    const enrichedData = filteredData.map(item => ({
      ...item,
      marcas: item.marca_id ? marcasMap.get(item.marca_id) : null,
      categorias: item.categoria_id ? categoriasMap.get(item.categoria_id) : null,
      grupo_descuento: item.grupo_descuento_id ? grupoDescuentoMap.get(item.grupo_descuento_id) : null,
    }))

    return NextResponse.json(enrichedData)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile || profile.rol !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can update products" }, { status: 403 })
    }

    const body = await request.json()
    const {
      id,
      referencia,
      cc,
      descripcion,
      embalaje,
      precio_unitario,
      moneda_id,
      stock_minimo = 0,
      stock = 0,
      observacion,
      marca_id,
      grupo_descuento_id,
      categoria_id,
      activo,
      imageURL,
    } = body

    // Validate required fields
    if (!id || !referencia || !cc || !descripcion || !embalaje || precio_unitario === undefined || !moneda_id || !grupo_descuento_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (precio_unitario < 0) {
      return NextResponse.json(
        { error: "Precio unitario cannot be negative" },
        { status: 400 }
      )
    }

    if (stock_minimo < 0) {
      return NextResponse.json(
        { error: "Stock mínimo cannot be negative" },
        { status: 400 }
      )
    }

    if (stock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      )
    }

    // Check if product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from("articulos")
      .select("id")
      .eq("id", id)
      .maybeSingle()

    if (checkError || !existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Update product in database
    const { data, error } = await supabase
      .from("articulos")
      .update({
        referencia,
        cc,
        descripcion,
        embalaje,
        precio_unitario: parseFloat(precio_unitario),
        moneda_id: parseInt(moneda_id),
        stock_minimo: parseInt(stock_minimo),
        stock: parseInt(stock),
        observacion: observacion || null,
        marca_id: marca_id ? parseInt(marca_id) : null,
        grupo_descuento_id: parseInt(grupo_descuento_id),
        categoria_id: categoria_id ? parseInt(categoria_id) : null,
        imageURL: imageURL || null,
        ...(activo !== undefined && { activo }),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to update product" },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Product not found after update" },
        { status: 404 }
      )
    }

    // Fetch the complete product with relations
    const { data: completeData, error: fetchError } = await supabase
      .from("articulos")
      .select("*, marcas(nombre), grupo_descuento(nombre), categorias(nombre)")
      .eq("id", id)
      .maybeSingle()

    if (fetchError || !completeData) {
      console.error("Fetch error:", fetchError)
      return NextResponse.json(
        { error: "Failed to fetch updated product" },
        { status: 500 }
      )
    }

    return NextResponse.json(completeData, { status: 200 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
