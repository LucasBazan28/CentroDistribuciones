import { ShoppingCart, Eye } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Product } from "@/app/lib/types";

const gradients = [
  "bg-gradient-to-br from-blue-100 to-blue-200",
  "bg-gradient-to-br from-green-100 to-green-200",
  "bg-gradient-to-br from-amber-100 to-amber-200",
  "bg-gradient-to-br from-red-100 to-red-200",
  "bg-gradient-to-br from-purple-100 to-purple-200",
  "bg-gradient-to-br from-cyan-100 to-cyan-200",
  "bg-gradient-to-br from-gray-100 to-gray-200",
  "bg-gradient-to-br from-yellow-100 to-yellow-200",
];

function getGradientForProduct(id: number): string {
  return gradients[id % gradients.length];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("articulos")
      .select("*, categorias(nombre)")
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .range(0, 7);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await fetchFeaturedProducts();

  return (
    <section id="productos" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Productos Destacados
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              Los más vendidos de nuestro catálogo
            </p>
          </div>
          <a
            href="/products"
            className="hidden text-sm font-semibold text-primary transition-colors hover:text-primary-dark sm:inline-block"
          >
            Ver todos &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Product image placeholder */}
                <div
                  className={`relative flex h-48 items-center justify-center ${getGradientForProduct(
                    product.id
                  )}`}
                >
                  <span className="text-4xl font-light text-gray-300">
                    {product.categorias?.nombre?.charAt(0) || "P"}
                  </span>
                  <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      className="rounded-full bg-white p-2 shadow-md transition-colors hover:bg-primary hover:text-white"
                      aria-label="Ver detalle"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="rounded-full bg-white p-2 shadow-md transition-colors hover:bg-primary hover:text-white"
                      aria-label="Agregar al carrito"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {product.categorias?.nombre || "Sin categoría"}
                  </span>
                  <h3 className="mt-1.5 text-sm font-semibold leading-snug text-gray-800 line-clamp-2">
                    {product.referencia} - {product.descripcion}
                  </h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.precio_venta)}
                    </span>
                    <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white">
                      Ver más
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No hay productos disponibles</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <a
            href="/products"
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Ver todos los productos &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
