import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"

export const dynamic = "force-dynamic"

const PAGE = 1000 // Supabase returns at most 1000 rows per request

// GET /api/ventas/dashboard -> every sale (only the fields the dashboard needs) and every client.
export async function GET() {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const ventas: Record<string, unknown>[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("ventas")
      .select("fecha, tipo, neto_ars, neto_usd, cliente_id")
      .order("id")
      .range(from, from + PAGE - 1)
    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    ventas.push(...data)
    if (data.length < PAGE) break
  }

  const clientes: Record<string, unknown>[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, razon_social, cuit")
      .order("id")
      .range(from, from + PAGE - 1)
    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    clientes.push(...data)
    if (data.length < PAGE) break
  }

  return NextResponse.json({ ventas, clientes })
}
