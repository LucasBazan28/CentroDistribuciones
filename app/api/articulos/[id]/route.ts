import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get("public") === "true"

    const resolvedParams = await params
    const productId = parseInt(resolvedParams.id)
    console.log(`Fetching product with ID: ${productId}, public: ${isPublic}`)
    if (!isPublic) {
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

      const { data, error } = await supabase
        .from("articulos")
        .select("*, marcas(nombre), grupo_descuento(nombre, descuento), categorias(nombre)")
        .eq("id", productId)
        .maybeSingle()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!data) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      return NextResponse.json(data)
    }

    const { data, error } = await supabase
      .from("articulos")
      .select(
        "id, referencia, descripcion, precio_unitario, precio_venta, stock, categoria_id, marca_id, grupo_descuento_id, imageURL, marcas(nombre), grupo_descuento(nombre, descuento), categorias(nombre)"
      )
      .eq("id", productId)
      .eq("activo", true)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
