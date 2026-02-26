const brands = [
  { name: "Siemens", initials: "S" },
  { name: "Schneider Electric", initials: "SE" },
  { name: "Phoenix Contact", initials: "PC" },
  { name: "ABB", initials: "ABB" },
  { name: "Genrod", initials: "G" },
  { name: "Zoloda", initials: "Z" },
  { name: "IMSA", initials: "IM" },
  { name: "Prysmian", initials: "P" },
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
            Distribuidor oficial de las marcas líderes del mercado eléctrico
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {brands.map((brand) => (
            <a
              key={brand.name}
              href="#"
              className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-400 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                {brand.initials}
              </div>
              <span className="mt-2 text-xs font-medium text-gray-500 transition-colors group-hover:text-primary">
                {brand.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
