import { Truck, Clock, Award, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Envíos a Todo el País",
    description: "Despachos desde nuestro centro de distribución a todo el territorio nacional.",
  },
  {
    icon: Clock,
    title: "Despachos en 48hs",
    description: "Procesamos y despachamos tu pedido en un máximo de 48 horas hábiles.",
  },
  {
    icon: Award,
    title: "+30 Años de Trayectoria",
    description: "Más de tres décadas siendo referentes en distribución de material eléctrico.",
  },
  {
    icon: ShieldCheck,
    title: "Distribuidor Oficial",
    description: "Representantes autorizados de las principales marcas del mercado.",
  },
];

export default function FeaturesStrip() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <feature.icon size={30} strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-800">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
