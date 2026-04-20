"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Cpu,
  ShieldCheck,
  Lightbulb,
  Cable,
  Gauge,
  Plug,
} from "lucide-react";

interface Category {
  id: number;
  nombre: string;
}

interface CategoryDisplay extends Category {
  icon: React.ComponentType<any>;
  color: string;
}

const iconMap: Record<number, { icon: React.ComponentType<any>; color: string }> = {
  2: { icon: Cpu, color: "from-blue-500 to-blue-700" },
  4: { icon: ShieldCheck, color: "from-emerald-500 to-emerald-700" },
  1: { icon: Lightbulb, color: "from-amber-400 to-amber-600" },
  14: { icon: Cable, color: "from-red-500 to-red-700" },
  8: { icon: Gauge, color: "from-purple-500 to-purple-700" },
  5: { icon: Plug, color: "from-cyan-500 to-cyan-700" },
};

export default function ProductCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const ids = "2,4,1,14,8,5";
        const response = await fetch(`/api/categorias?ids=${ids}`);
        if (!response.ok) throw new Error("Failed to fetch categories");

        const data: Category[] = await response.json();

        const displayCategories = data.map((cat) => ({
          ...cat,
          icon: iconMap[cat.id]?.icon || Cpu,
          color: iconMap[cat.id]?.color || "from-gray-500 to-gray-700",
        }));

        setCategories(displayCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <section id="categorias" className="bg-light py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Nuestras Categorías
            </h2>
          </div>
          <div className="text-center text-gray-500">Cargando categorías...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="categorias" className="bg-light py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Nuestras Categorías
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Encontrá todo lo que necesitás en material eléctrico e industrial
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.nombre)}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg text-left"
            >
              <div
                className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${cat.color} p-3 text-white shadow-md`}
              >
                <cat.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-800 transition-colors group-hover:text-primary">
                {cat.nombre}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Productos de {cat.nombre.toLowerCase()}
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Ver productos &rarr;
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
