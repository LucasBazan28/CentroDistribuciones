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

    return NextResponse.json(data[0], { status: 201 })
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch all articulos with marca info
    const { data, error } = await supabase
      .from("articulos")
      .select("*, marcas(nombre), grupo_descuento(nombre), categorias(nombre)")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
