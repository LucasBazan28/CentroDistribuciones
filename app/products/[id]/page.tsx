import Link from "next/link"
import { notFound } from "next/navigation"
import ProductDetails from "@/app/components/ProductDetails"
import ProductGrid from "@/app/components/ProductGrid"
import { fetchProductById, fetchRelatedProducts } from "@/app/lib/productHelpers"
import { ChevronLeft } from "lucide-react"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params
  const product = await fetchProductById(parseInt(resolvedParams.id))

  if (!product) {
    return {
      title: "Producto no encontrado",
      description: "El producto que buscas no existe",
    }
  }

  return {
    title: `${product.referencia} - Centro Distribuciones`,
    description: product.descripcion,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const productId = parseInt(resolvedParams.id)
  const product = await fetchProductById(productId)

  if (!product) {
    notFound()
  }

  const relatedProducts = await fetchRelatedProducts(product, 4)

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            <ChevronLeft size={16} />
            Volver al catálogo
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductDetails product={product} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-white py-12 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Productos Relacionados
            </h2>
            <ProductGrid products={relatedProducts} />
          </div>
        </div>
      )}

      {/* Back to Catalog Link */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
        >
          <ChevronLeft size={16} />
          Volver al catálogo
        </Link>
      </div>
    </main>
  )
}
