import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"

export const dynamic = "force-dynamic"

const PAGE = 1000 // Supabase returns at most 1000 rows per request

// Line items with what the articles section needs from their sale and article.
const SELECT_ITEMS =
  "venta_id, articulo_id, descripcion, cantidad, subtotal_ars, ventas(fecha, tipo, dolar, cliente_id, neto_usd), articulos(referencia, marcas(nombre), categorias(nombre))"

// Error codes when the ventas_items table does not exist yet (migration v4 not run).
const TABLA_INEXISTENTE = ["42P01", "PGRST205", "PGRST200"]

// GET /api/ventas/dashboard -> every sale (only the fields the dashboard needs), every client and every sale line.
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

  const items: Record<string, unknown>[] = []
  let itemsHabilitados = true
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("ventas_items")
      .select(SELECT_ITEMS)
      .order("id")
      .range(from, from + PAGE - 1)
    if (error) {
      if (TABLA_INEXISTENTE.includes(error.code)) {
        itemsHabilitados = false
        break
      }
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    items.push(...data)
    if (data.length < PAGE) break
  }

  return NextResponse.json({ ventas, clientes, items, itemsHabilitados })
}
