import {
  Cpu,
  ShieldCheck,
  Lightbulb,
  Cable,
  Gauge,
  Plug,
} from "lucide-react";

const categories = [
  {
    icon: Cpu,
    title: "Automatización",
    description: "PLCs, variadores de frecuencia, sensores y componentes de control industrial.",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: ShieldCheck,
    title: "Protección y Maniobra",
    description: "Interruptores, disyuntores, contactores y relés de protección.",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    icon: Lightbulb,
    title: "Iluminación",
    description: "Luminarias LED industriales, comerciales y de exterior.",
    color: "from-amber-400 to-amber-600",
  },
  {
    icon: Cable,
    title: "Cables",
    description: "Cables de energía, datos, comando y especiales para toda aplicación.",
    color: "from-red-500 to-red-700",
  },
  {
    icon: Gauge,
    title: "Tableros",
    description: "Gabinetes, bandejas portacables, borneras y accesorios de tablero.",
    color: "from-purple-500 to-purple-700",
  },
  {
    icon: Plug,
    title: "Instalación Eléctrica",
    description: "Material de instalación, canalizaciones, cajas y accesorios.",
    color: "from-cyan-500 to-cyan-700",
  },
];

export default function ProductCategories() {
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
            <a
              key={cat.title}
              href="#"
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${cat.color} p-3 text-white shadow-md`}
              >
                <cat.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-800 transition-colors group-hover:text-primary">
                {cat.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {cat.description}
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Ver productos &rarr;
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
