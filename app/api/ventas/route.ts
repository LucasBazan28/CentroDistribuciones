import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { padComprobante, round2 } from "@/app/lib/sales"

export const dynamic = "force-dynamic"

const TIPOS = ["factura", "nota_credito"]

// GET /api/ventas?anio=2026&mes=10        -> ventas del período
// GET /api/ventas?siguiente=factura       -> próximo número de comprobante sugerido
export async function GET(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const { searchParams } = new URL(request.url)

  const siguiente = searchParams.get("siguiente")
  if (siguiente) {
    if (!TIPOS.includes(siguiente)) {
      return NextResponse.json({ error: "Tipo de comprobante inválido" }, { status: 400 })
    }
    const { data, error } = await supabase
      .from("ventas")
      .select("nro_comprobante")
      .eq("tipo", siguiente)
      .order("nro_comprobante", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const next = data ? String(Number(data.nro_comprobante) + 1).padStart(8, "0") : ""
    return NextResponse.json({ siguiente: next })
  }

  const anio = Number(searchParams.get("anio"))
  const mes = Number(searchParams.get("mes"))

  let query = supabase
    .from("ventas")
    .select("*, clientes(cuit, razon_social)")
    .order("fecha", { ascending: true })
    .order("created_at", { ascending: true })

  if (anio) {
    const desde = mes ? `${anio}-${String(mes).padStart(2, "0")}-01` : `${anio}-01-01`
    const hastaDate = mes ? new Date(anio, mes, 1) : new Date(anio + 1, 0, 1)
    const hasta = `${hastaDate.getFullYear()}-${String(hastaDate.getMonth() + 1).padStart(2, "0")}-01`
    query = query.gte("fecha", desde).lt("fecha", hasta)
  }

  const { data, error } = await query
  if (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const body = await request.json()
  const tipo = String(body.tipo ?? "factura")
  const nro_comprobante = padComprobante(String(body.nro_comprobante ?? ""))
  const fecha = String(body.fecha ?? "")
  const cliente_id = Number(body.cliente_id)
  const neto_ars = round2(Number(body.neto_ars))
  const iva_ars = round2(Number(body.iva_ars))
  const dolar = round2(Number(body.dolar))

  if (!TIPOS.includes(tipo)) return NextResponse.json({ error: "Tipo de comprobante inválido" }, { status: 400 })
  if (!nro_comprobante) return NextResponse.json({ error: "El número de comprobante es obligatorio" }, { status: 400 })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return NextResponse.json({ error: "La fecha no es válida" }, { status: 400 })
  if (!cliente_id) return NextResponse.json({ error: "Seleccioná un cliente" }, { status: 400 })
  if (!(neto_ars > 0)) return NextResponse.json({ error: "El importe neto debe ser mayor a 0" }, { status: 400 })
  if (!(iva_ars >= 0)) return NextResponse.json({ error: "El IVA no es válido" }, { status: 400 })
  if (!(dolar > 0)) return NextResponse.json({ error: "La cotización del dólar debe ser mayor a 0" }, { status: 400 })

  const { data, error } = await supabase
    .from("ventas")
    .insert([{
      tipo,
      nro_comprobante,
      fecha,
      cliente_id,
      neto_ars,
      iva_ars,
      total_ars: round2(neto_ars + iva_ars),
      dolar,
      observacion: typeof body.observacion === "string" && body.observacion.trim() ? body.observacion.trim() : null,
    }])
    .select("*, clientes(cuit, razon_social)")
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: `Ya existe un comprobante con el número ${nro_comprobante}` }, { status: 409 })
    }
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "Falta el id de la venta" }, { status: 400 })

  const { error } = await supabase.from("ventas").delete().eq("id", Number(id))
  if (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
