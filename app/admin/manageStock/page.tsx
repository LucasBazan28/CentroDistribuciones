import StockTable from "@/app/components/StockTable"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"

export default function ManageStockPage() {
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
          <StockTable />
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