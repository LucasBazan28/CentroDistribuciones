import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"

export const dynamic = "force-dynamic"

// GET /api/articulos/buscar?q=texto -> up to 20 catalog items (active or not) to add to a sale.
export async function GET(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const q = (new URL(request.url).searchParams.get("q") ?? "")
    .replace(/[,()%*\\]/g, " ") // characters that break PostgREST's .or() syntax
    .trim()
  if (q.length < 2) return NextResponse.json([])

  const { data, error } = await supabase
    .from("articulos")
    .select("id, referencia, descripcion, precio_venta, moneda_id, iva, activo, marcas(nombre)")
    .or(`referencia.ilike.%${q}%,descripcion.ilike.%${q}%`)
    .order("activo", { ascending: false })
    .order("referencia")
    .limit(20)

  if (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
