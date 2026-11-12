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

const SELECT_VENTA =
  "*, clientes(cuit, razon_social), ventas_items(id, articulo_id, descripcion, cantidad, precio_unitario_ars, alicuota_iva, subtotal_ars, articulos(referencia))"

interface ItemInput {
  articulo_id: number | null
  descripcion: string
  cantidad: number
  precio_unitario_ars: number
  alicuota_iva: number
  subtotal_ars: number
}

// Validates the optional sale lines. Returns the normalized lines or an error message.
function parseItems(raw: unknown): { items: ItemInput[] } | { error: string } {
  if (raw == null) return { items: [] }
  if (!Array.isArray(raw)) return { error: "El detalle de artículos no es válido" }
  const items: ItemInput[] = []
  for (const [i, r] of raw.entries()) {
    const n = i + 1
    const descripcion = typeof r?.descripcion === "string" ? r.descripcion.trim() : ""
    const cantidad = Math.round(Number(r?.cantidad) * 1000) / 1000
    const precio = round2(Number(r?.precio_unitario_ars))
    const alicuota = Number(r?.alicuota_iva ?? 21)
    const articulo_id = r?.articulo_id == null || r.articulo_id === "" ? null : Number(r.articulo_id)
    if (!descripcion) return { error: `Renglón ${n}: falta la descripción` }
    if (!(cantidad > 0)) return { error: `Renglón ${n}: la cantidad debe ser mayor a 0` }
    if (!(precio >= 0)) return { error: `Renglón ${n}: el precio no es válido` }
    if (!(alicuota >= 0 && alicuota <= 100)) return { error: `Renglón ${n}: la alícuota no es válida` }
    if (articulo_id !== null && !(articulo_id > 0)) return { error: `Renglón ${n}: artículo inválido` }
    items.push({ articulo_id, descripcion, cantidad, precio_unitario_ars: precio, alicuota_iva: alicuota, subtotal_ars: round2(cantidad * precio) })
  }
  return { items }
}

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
    .select(SELECT_VENTA)
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

  const parsed = parseItems(body.items)
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { items } = parsed

  // Signed amounts: NC always negative, the rest as entered. With lines, the net is their sum.
  const netoBase = items.length ? items.reduce((acc, it) => acc + it.subtotal_ars, 0) : Number(body.neto_ars)
  const neto_ars = round2(applySign(tipo, netoBase))
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
    .select("id")
    .single()

  if (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (items.length) {
    const { error: itemsError } = await supabase
      .from("ventas_items")
      .insert(items.map((it) => ({ ...it, venta_id: data.id })))
    if (itemsError) {
      // No transactions over the REST API: undo the sale so it is not left without its lines.
      await supabase.from("ventas").delete().eq("id", data.id)
      console.error("Database error:", itemsError)
      return NextResponse.json({ error: `No se pudo guardar el detalle: ${itemsError.message}` }, { status: 500 })
    }
  }

  const { data: venta, error: readError } = await supabase.from("ventas").select(SELECT_VENTA).eq("id", data.id).single()
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })
  return NextResponse.json(venta, { status: 201 })
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
