import Link from "next/link";
import { Plus, Package, Home, Percent, Tag, Folder } from "lucide-react";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona tus productos e inventario</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* New Product Card */}
          <Link
            href="/admin/newProduct"
            className="group h-48 rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary p-8 flex flex-col justify-center items-center text-center hover:scale-105"
          >
            <Plus
              size={48}
              className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto nuevo</h2>
            <p className="text-gray-600">Agregá un producto nuevo a tu catálogo</p>
          </Link>

          {/* Manage Stock Card */}
          <Link
            href="/admin/manageStock"
            className="group h-48 rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary p-8 flex flex-col justify-center items-center text-center hover:scale-105"
          >
            <Package
              size={48}
              className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrar Stock</h2>
            <p className="text-gray-600">Actualiza el inventario de tus productos</p>
          </Link>

          {/* Manage Discounts Card */}
          <Link
            href="/admin/manageDiscounts"
            className="group h-48 rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary p-8 flex flex-col justify-center items-center text-center hover:scale-105"
          >
            <Percent
              size={48}
              className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrar Descuentos</h2>
            <p className="text-gray-600">Organiza grupos de descuento por marca</p>
          </Link>

          {/* Manage Brands Card */}
          <Link
            href="/admin/manageBrands"
            className="group h-48 rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary p-8 flex flex-col justify-center items-center text-center hover:scale-105"
          >
            <Tag
              size={48}
              className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrar Marcas</h2>
            <p className="text-gray-600">Agrega, edita o elimina marcas</p>
          </Link>

          {/* Manage Categories Card */}
          <Link
            href="/admin/manageCategories"
            className="group h-48 rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary p-8 flex flex-col justify-center items-center text-center hover:scale-105"
          >
            <Folder
              size={48}
              className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrar Categorías</h2>
            <p className="text-gray-600">Organiza categorías por marca</p>
          </Link>
        </div>

        {/* Back to Home Button */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            <Home size={20} />
            Volver a la página principal
          </Link>
        </div>
      </div>
    </main>
  );
}