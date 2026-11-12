import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { isValidCuit, onlyDigits } from "@/app/lib/sales"

export const dynamic = "force-dynamic"

function optional(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function parseCliente(body: Record<string, unknown>) {
  const cuit = onlyDigits(String(body.cuit ?? ""))
  const razon_social = String(body.razon_social ?? "").trim()

  if (!razon_social) return { error: "La razón social es obligatoria" }
  // CUIT is optional (final consumers), but when present it must be valid.
  if (cuit && !isValidCuit(cuit)) return { error: "El CUIT no es válido (11 dígitos con dígito verificador correcto)" }

  return {
    data: {
      cuit: cuit || null,
      razon_social: razon_social.toUpperCase(),
      email: optional(body.email),
      telefono: optional(body.telefono),
      direccion: optional(body.direccion),
    },
  }
}

export async function GET() {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("razon_social")

  if (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const parsed = parseCliente(await request.json())
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const { data, error } = await supabase.from("clientes").insert([parsed.data]).select().single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ya existe un cliente con ese CUIT" }, { status: 409 })
    }
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const body = await request.json()
  const id = Number(body.id)
  if (!id) return NextResponse.json({ error: "Falta el id del cliente" }, { status: 400 })

  const parsed = parseCliente(body)
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const { data, error } = await supabase
    .from("clientes")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ya existe un cliente con ese CUIT" }, { status: 409 })
    }
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "Falta el id del cliente" }, { status: 400 })

  const { error } = await supabase.from("clientes").delete().eq("id", Number(id))

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "No se puede eliminar: el cliente tiene ventas registradas" },
        { status: 409 }
      )
    }
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
