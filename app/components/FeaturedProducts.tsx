import { ShoppingCart, Eye } from "lucide-react";

const products = [
  {
    name: "Variador de Frecuencia Siemens V20",
    category: "Automatización",
    price: "$485.000",
    image: "bg-gradient-to-br from-blue-100 to-blue-200",
  },
  {
    name: "Interruptor Termomagnético Schneider 3x32A",
    category: "Protección",
    price: "$42.500",
    image: "bg-gradient-to-br from-green-100 to-green-200",
  },
  {
    name: "Panel LED 60x60 40W Fría",
    category: "Iluminación",
    price: "$28.900",
    image: "bg-gradient-to-br from-amber-100 to-amber-200",
  },
  {
    name: 'Cable Sintenax 3x2.5mm² x 100m',
    category: "Cables",
    price: "$156.000",
    image: "bg-gradient-to-br from-red-100 to-red-200",
  },
  {
    name: "Contactor Siemens 3RT2 25A",
    category: "Protección",
    price: "$89.700",
    image: "bg-gradient-to-br from-purple-100 to-purple-200",
  },
  {
    name: "PLC S7-1200 CPU 1214C",
    category: "Automatización",
    price: "$1.250.000",
    image: "bg-gradient-to-br from-cyan-100 to-cyan-200",
  },
  {
    name: "Gabinete Estanco IP65 400x300",
    category: "Tableros",
    price: "$67.800",
    image: "bg-gradient-to-br from-gray-100 to-gray-200",
  },
  {
    name: "Luminaria LED Estanca 2x18W",
    category: "Iluminación",
    price: "$35.200",
    image: "bg-gradient-to-br from-yellow-100 to-yellow-200",
  },
];

export default function FeaturedProducts() {
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
            href="#"
            className="hidden text-sm font-semibold text-primary transition-colors hover:text-primary-dark sm:inline-block"
          >
            Ver todos &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Product image placeholder */}
              <div
                className={`relative flex h-48 items-center justify-center ${product.image}`}
              >
                <span className="text-4xl font-light text-gray-300">
                  {product.category.charAt(0)}
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
                  {product.category}
                </span>
                <h3 className="mt-1.5 text-sm font-semibold leading-snug text-gray-800 line-clamp-2">
                  {product.name}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {product.price}
                  </span>
                  <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white">
                    Ver más
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <a
            href="#"
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Ver todos los productos &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
