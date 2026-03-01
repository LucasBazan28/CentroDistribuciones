import Image from "next/image";

const brands = [
  { name: "Zoloda", logo: "/logos/LOGO-ZOLODA.png" },
  //{ name: "LCT", initials: "L" },
  { name: "Weg", logo: "/logos/LOGO-WEG.jpeg" },
  { name: "WENTINCK", logo: "/logos/LOGO-WTK.png" },
  { name: "TECNOBOX", logo: "/logos/LOGO-TECNOBOX-RGB-VERT.png" },
  //{ name: "Accesorios Eléctricos Argentinos S.A.", initials: "AEASA" },
  { name: "SCAME", logo: "/logos/LOGO-SCAME.jpeg" },
  { name: "HellermannTyton", logo: "/logos/LOGO-HELLERMANN.jpeg" },
  { name: "TRAMONTINA", logo: "/logos/LOGO-TRAMONTINA-fondo-blanco.jpeg" },
];

export default function BrandsSection() {
  return (
    <section className="bg-light py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Marcas que Distribuimos
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            DISTRIBUIDOR OFICIAL DE MARCAS LÍDERES
          </p>
          <p className="mt-3 text-sm text-gray-500">
            CON RESPALDO TÉCNICO Y EXPERIENCIA EN PROYECTOS
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <a
              key={brand.name}
              href="#"
              className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-400 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
              </div>
              <span className="mt-3 text-sm font-medium text-gray-500 transition-colors group-hover:text-primary">
                {brand.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
