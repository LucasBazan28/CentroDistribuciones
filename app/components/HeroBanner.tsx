"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const brands = [
  { name: "Zoloda", logo: "/logos/LOGO-ZOLODA.png" },
  { name: "Weg", logo: "/logos/LOGO-WEG.png" },
  { name: "WENTINCK", logo: "/logos/LOGO-WTK.png" },
  { name: "TECNOBOX", logo: "/logos/LOGO-TECNOBOX-RGB-VERT.png" },
  { name: "SCAME", logo: "/logos/LOGO-SCAME.jpeg" },
  { name: "HellermannTyton", logo: "/logos/LOGO-HELLERMANN.jpeg" },
  { name: "TRAMONTINA", logo: "/logos/LOGO-TRAMONTINA.png" },
];

const slides = [
  {
    title: "Distribuidor Oficial de Material Eléctrico",
    subtitle:
      "Automatización, protección, iluminación y cables de las mejores marcas del mercado.",
    cta: "Ver Productos",
    ctaHref: "#productos",
    gradient: "from-primary-dark via-primary to-primary-light",
  },
  {
    title: "Acompañamos la Transformación Digital de tu Empresa",
    subtitle:
      "Soluciones integrales en automatización industrial con tecnología de última generación.",
    cta: "Conocé Más",
    ctaHref: "#categorias",
    gradient: "from-dark via-primary-dark to-primary",
  },
  {
    title: "Envíos a Todo el País en 48hs",
    subtitle:
      "Más de 40 años distribuyendo material eléctrico. Comprá online y recibí en tu domicilio.",
    cta: "Contactanos",
    ctaHref: "#contacto",
    gradient: "from-primary via-primary-dark to-dark",
  },
  {
    title: "Marcas que Distribuimos",
    subtitle: "Distribuidor oficial de las mejores marcas del mercado",
    isBrandsSlide: true,
    gradient: "from-primary-light via-primary to-dark",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const duration = slides[current].isBrandsSlide ? 8000 : 5000;
    const timer = setInterval(next, duration);
    return () => clearInterval(timer);
  }, [next, current, slides]);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[420px] sm:h-[480px] md:h-[540px]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center transition-opacity duration-700 ease-in-out bg-gradient-to-br ${slide.gradient} ${
              index === current
                ? "opacity-100 z-10"
                : "opacity-0 z-0"
            }`}
          >
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 h-64 w-64 rounded-full border-[40px] border-white/20" />
              <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full border-[30px] border-white/20" />
              <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border-[50px] border-white/10" />
            </div>
            <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8">
              {slide.isBrandsSlide ? (
                <div className="w-full text-center">
                  <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl mb-2 animate-slide-left">
                    {slide.title}
                  </h1>
                  <p className="text-lg text-white/85 mb-8 animate-slide-right">
                    {slide.subtitle}
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 lg:gap-2">
                    {brands.map((brand) => (
                      <div
                        key={brand.name}
                        className="flex flex-col items-center justify-center rounded-lg bg-gray-200 backdrop-blur-sm p-4 transition-all hover:bg-gray-300"
                      >
                        <div className="flex h-20 w-20 items-center justify-center">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                        <span className="mt-2 text-xs font-medium text-primary text-center">
                          {brand.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl">
                  <h1
                    className={`text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl ${
                      index === current ? "animate-slide-left" : ""
                    }`}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className={`mt-4 text-lg leading-relaxed text-white/85 sm:text-xl ${
                      index === current ? "animate-slide-right" : ""
                    }`}
                  >
                    {slide.subtitle}
                  </p>
                  <a
                    href={slide.ctaHref}
                    className="mt-8 inline-block rounded-lg bg-accent px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-accent-dark hover:shadow-xl"
                  >
                    {slide.cta}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
        aria-label="Anterior"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
        aria-label="Siguiente"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === current
                ? "w-8 bg-accent"
                : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
