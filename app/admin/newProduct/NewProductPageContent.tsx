import NewProductForm from "@/app/components/NewProductForm"
import { ArrowLeft, PackagePlus } from "lucide-react"
import Link from "next/link"
import BackToAdminButton from "@/app/components/BackToAdminButton"
export default function NewProductPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <BackToAdminButton />
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <PackagePlus className="h-6 w-6 text-white" />
              </div>
              Crear Nuevo Producto
            </h1>
            <p className="mt-2 text-gray-600">
              Agregá un nuevo artículo al inventario. Todos los campos marcados con * son obligatorios.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <NewProductForm />
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">💡 Consejo:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>La referencia debe ser única en el sistema</li>
            <li>El embalaje debe ser mayor a 0</li>
            <li>El precio unitario y stock no pueden ser negativos</li>
            <li>Los campos de stock son opcionales y se establecen en 0 por defecto</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
