import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    // Get specific category IDs from query params
    const idsParam = searchParams.get("ids")
    const ids = idsParam ? idsParam.split(",").map(id => parseInt(id)) : []

    let query = supabase
      .from("categorias")
      .select("id, nombre")

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
