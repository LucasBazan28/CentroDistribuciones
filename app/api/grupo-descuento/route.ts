import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

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
      return NextResponse.json({ error: "Forbidden: Only admins can create discount groups" }, { status: 403 })
    }

    const body = await request.json()
    const { nombre, descuento, marca_id } = body

    // Validate required fields
    if (!nombre || descuento === undefined || !marca_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate numeric constraints
    if (descuento < 0) {
      return NextResponse.json(
        { error: "Discount cannot be negative" },
        { status: 400 }
      )
    }

    // Check if name already exists for this brand
    const { data: existing, error: checkError } = await supabase
      .from("grupo_descuento")
      .select("id")
      .eq("nombre", nombre.trim())
      .eq("marca_id", parseInt(marca_id))
      .maybeSingle()

    if (checkError) {
      console.error("Database error:", checkError)
      return NextResponse.json(
        { error: checkError.message || "Failed to validate discount group" },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json(
        { error: "A discount group with this name already exists for this brand" },
        { status: 409 }
      )
    }

    // Insert into database
    const { data, error } = await supabase
      .from("grupo_descuento")
      .insert([
        {
          nombre: nombre.trim(),
          descuento: parseFloat(descuento),
          marca_id: parseInt(marca_id),
        },
      ])
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create discount group" },
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
      return NextResponse.json({ error: "Forbidden: Only admins can update discount groups" }, { status: 403 })
    }

    const body = await request.json()
    const { id, nombre, descuento, marca_id } = body

    // Validate required fields
    if (!id || !nombre || descuento === undefined || !marca_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate numeric constraints
    if (descuento < 0) {
      return NextResponse.json(
        { error: "Discount cannot be negative" },
        { status: 400 }
      )
    }

    // Check if name already exists for this brand (excluding current record)
    const { data: existing, error: checkError } = await supabase
      .from("grupo_descuento")
      .select("id")
      .eq("nombre", nombre.trim())
      .eq("marca_id", parseInt(marca_id))
      .neq("id", parseInt(id))
      .maybeSingle()

    if (checkError) {
      console.error("Database error:", checkError)
      return NextResponse.json(
        { error: checkError.message || "Failed to validate discount group" },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json(
        { error: "A discount group with this name already exists for this brand" },
        { status: 409 }
      )
    }

    // Update in database
    const { data, error } = await supabase
      .from("grupo_descuento")
      .update({
        nombre: nombre.trim(),
        descuento: parseFloat(descuento),
        marca_id: parseInt(marca_id),
      })
      .eq("id", parseInt(id))
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to update discount group" },
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
      return NextResponse.json({ error: "Forbidden: Only admins can delete discount groups" }, { status: 403 })
    }

    const body = await request.json()
    const { id } = body

    // Validate required field
    if (!id) {
      return NextResponse.json(
        { error: "Missing id field" },
        { status: 400 }
      )
    }

    // Delete from database
    const { error } = await supabase
      .from("grupo_descuento")
      .delete()
      .eq("id", parseInt(id))

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to delete discount group" },
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
