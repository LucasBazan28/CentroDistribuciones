import Link from "next/link";
import { Plus, Package, Home, Percent } from "lucide-react";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your products and inventory</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">New Product</h2>
            <p className="text-gray-600">Add a new product to your catalog</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Stock</h2>
            <p className="text-gray-600">Update product inventory</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Discounts</h2>
            <p className="text-gray-600">Organize discount groups by brand</p>
          </Link>
        </div>

        {/* Back to Home Button */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            <Home size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}