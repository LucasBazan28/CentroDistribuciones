import StockTable from "@/app/components/StockTable"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface Articulo {
  id: number
  referencia: string
  cc: number
  descripcion: string
  embalaje: string
  precio_unitario: number
  moneda_id: number
  stock_minimo: number
  stock: number
  observacion: string | null
  marca_id: number | null
  activo: boolean
  grupo_descuento_id: number
  categoria_id: number | null
  marcas?: { nombre: string } | null
  grupo_descuento?: { nombre: string }
  categorias?: { nombre: string } | null
}

async function fetchArticulos(): Promise<Articulo[]> {
  try {
    const supabase = await createSupabaseServerClient()

    // Check auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      redirect("/login")
    }

    // Check if admin
    const { data: profile, error: profileError } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile || profile.rol !== "admin") {
      redirect("/admin")
    }

    // Fetch all articulos with pagination (1000 rows at a time)
    let allData: Articulo[] = []
    let offset = 0
    const pageSize = 1000

    while (true) {
      const { data, error } = await supabase
        .from("articulos")
        .select("*, marcas(nombre), grupo_descuento(nombre), categorias(nombre)")
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        break
      }

      allData = [...allData, ...data]

      if (data.length < pageSize) {
        break
      }

      offset += pageSize
    }
    return allData
  } catch (error) {
    console.error("Error fetching articulos:", error)
    return []
  }
}

export default async function ManageStockPage() {
  const articulos = await fetchArticulos()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Admin
              </Link>
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Package className="h-6 w-6 text-white" />
              </div>
              Manejar Stock
            </h1>
            <p className="mt-2 text-gray-600">
              Visualiza y administra el inventario de todos tus artículos.
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <StockTable initialData={articulos} />
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">📊 Información útil:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Los artículos con stock rojo están por debajo del mínimo requerido</li>
            <li>Puedes buscar artículos por referencia, descripción o marca</li>
            <li>Los resúmenes al final muestran estadísticas generales del inventario</li>
            <li>Usa los botones de acciones para editar detalles o ver más información</li>
          </ul>
        </div>
      </div>
    </main>
  )
}