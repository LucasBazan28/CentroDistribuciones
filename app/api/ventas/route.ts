import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import {
  TIPOS_REQUIEREN_CUIT,
  TIPOS_SIN_CLIENTE,
  tipoEnTexto,
  applySign,
  isTipo,
  padComprobante,
  round2,
} from "@/app/lib/sales"

export const dynamic = "force-dynamic"

const round6 = (n: number) => Math.round(n * 1e6) / 1e6

// GET /api/ventas?anio=2026&mes=10        -> ventas del período
// GET /api/ventas?siguiente=A       -> próximo número de comprobante sugerido
export async function GET(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const { searchParams } = new URL(request.url)

  const siguiente = searchParams.get("siguiente")
  if (siguiente) {
    if (!isTipo(siguiente)) {
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
  const tipo = String(body.tipo ?? "A")
  const nro_comprobante = padComprobante(String(body.nro_comprobante ?? ""))
  const fecha = String(body.fecha ?? "")
  const cliente_id = body.cliente_id == null || body.cliente_id === "" ? null : Number(body.cliente_id)
  const dolar = round2(Number(body.dolar))

  if (!isTipo(tipo)) return NextResponse.json({ error: "Tipo de comprobante inválido" }, { status: 400 })
  if (!nro_comprobante) return NextResponse.json({ error: "El número de comprobante es obligatorio" }, { status: 400 })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return NextResponse.json({ error: "La fecha no es válida" }, { status: 400 })
  if (cliente_id !== null && !(cliente_id > 0)) return NextResponse.json({ error: "Cliente inválido" }, { status: 400 })
  if (cliente_id === null && !TIPOS_SIN_CLIENTE.includes(tipo)) {
    return NextResponse.json({ error: `Seleccioná un cliente para la ${tipoEnTexto(tipo)}` }, { status: 400 })
  }

  // Signed amounts: NC always negative, the rest as entered.
  const neto_ars = round2(applySign(tipo, Number(body.neto_ars)))
  const iva_ars = round2(applySign(tipo, Number(body.iva_ars ?? 0)))
  if (!Number.isFinite(neto_ars) || neto_ars === 0) {
    return NextResponse.json({ error: "El importe neto no puede ser 0" }, { status: 400 })
  }
  if (!Number.isFinite(iva_ars)) return NextResponse.json({ error: "El IVA no es válido" }, { status: 400 })
  if (!(dolar > 0)) return NextResponse.json({ error: "La cotización del dólar debe ser mayor a 0" }, { status: 400 })

  if (cliente_id !== null && TIPOS_REQUIEREN_CUIT.includes(tipo)) {
    const { data: cli, error: cliError } = await supabase
      .from("clientes")
      .select("cuit")
      .eq("id", cliente_id)
      .maybeSingle()
    if (cliError) return NextResponse.json({ error: cliError.message }, { status: 500 })
    if (!cli) return NextResponse.json({ error: "El cliente no existe" }, { status: 400 })
    if (!cli.cuit) {
      return NextResponse.json(
        { error: `La ${tipoEnTexto(tipo)} requiere un cliente con CUIT` },
        { status: 400 }
      )
    }
  }

  // The same number can legitimately repeat (point-of-sale changes), so it is not blocked,
  // but the user has to confirm it explicitly.
  if (!body.permitir_duplicado) {
    const { data: dup, error: dupError } = await supabase
      .from("ventas")
      .select("fecha, clientes(razon_social)")
      .eq("tipo", tipo)
      .eq("nro_comprobante", nro_comprobante)
      .limit(1)
      .maybeSingle()
    if (dupError) return NextResponse.json({ error: dupError.message }, { status: 500 })
    if (dup) {
      const quien = (dup.clientes as { razon_social?: string } | null)?.razon_social ?? "consumidor final"
      return NextResponse.json(
        {
          duplicado: true,
          error: `Ya existe una ${tipoEnTexto(tipo)} N° ${nro_comprobante} (${dup.fecha}, ${quien})`,
        },
        { status: 409 }
      )
    }
  }

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
      neto_usd: round6(neto_ars / dolar),
      iva_usd: round6(iva_ars / dolar),
      total_usd: round6((neto_ars + iva_ars) / dolar),
      observacion: typeof body.observacion === "string" && body.observacion.trim() ? body.observacion.trim() : null,
    }])
    .select("*, clientes(cuit, razon_social)")
    .single()

  if (error) {
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
