import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    // Get specific category IDs from query params
    const idsParam = searchParams.get("ids")
    const ids = idsParam ? idsParam.split(",").map(id => parseInt(id)) : []

    let query = supabase
      .from("categorias")
      .select("id, nombre, marca_id")

    if (ids.length > 0) {
      query = query.in("id", ids)
    }

    const { data, error } = await query

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

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()

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

    const body = await request.json()
    const { nombre, marca_id } = body

    if (!nombre || !nombre.trim() || !marca_id) {
      return NextResponse.json(
        { error: "Category name and brand are required" },
        { status: 400 }
      )
    }

    const { data: existing, error: checkError } = await supabase
      .from("categorias")
      .select("id")
      .eq("nombre", nombre.trim())
      .eq("marca_id", marca_id)
      .maybeSingle()

    if (checkError) {
      console.error("Database error:", checkError)
      return NextResponse.json(
        { error: checkError.message },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists for this brand" },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from("categorias")
      .insert([{ nombre: nombre.trim(), marca_id }])
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: error.message },
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

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()

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

    const body = await request.json()
    const { id, nombre, marca_id } = body

    if (!id || !nombre || !nombre.trim() || !marca_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data: existing, error: checkError } = await supabase
      .from("categorias")
      .select("id")
      .eq("nombre", nombre.trim())
      .eq("marca_id", marca_id)
      .neq("id", id)
      .maybeSingle()

    if (checkError) {
      console.error("Database error:", checkError)
      return NextResponse.json(
        { error: checkError.message },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists for this brand" },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from("categorias")
      .update({ nombre: nombre.trim(), marca_id })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0], { status: 200 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()

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

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: "Missing id field" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("categorias")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
