import StockTable from "@/app/components/StockTable"
import ManageStockClient from "@/app/admin/manageStock/ManageStockClient"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import BackToAdminButton from "@/app/components/BackToAdminButton"

interface Marca {
  id: number
  nombre: string
}

async function fetchMarcas(): Promise<Marca[]> {
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

    // Fetch all marcas
    const { data, error } = await supabase
      .from("marcas")
      .select("id, nombre")
      .order("nombre", { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error fetching marcas:", error)
    return []
  }
}

export default async function ManageStockPage() {
  const marcas = await fetchMarcas()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
          <BackToAdminButton />
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Package className="h-6 w-6 text-white" />
              </div>
              Manejar Stock
            </h1>
            <p className="mt-2 text-gray-600">
              Visualiza y administra el inventario de tus artículos por marca.
            </p>
          </div>
        </div>

        {/* Client Component */}
        <ManageStockClient marcas={marcas} />
      </div>
    </main>
  )
}