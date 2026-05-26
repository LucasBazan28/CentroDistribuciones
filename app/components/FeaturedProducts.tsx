import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Product } from "@/app/lib/types";
import FeaturedProductsList from "./FeaturedProductsList";

async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("articulos")
      .select("*, categorias(nombre), imageURL")
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

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {products.length > 0 ? (
            <FeaturedProductsList products={products} />
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
