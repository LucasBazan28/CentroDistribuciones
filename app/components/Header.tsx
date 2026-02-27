"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Phone,
  Mail,
  Menu,
  X,
  ShoppingCart,
  Search,
} from "lucide-react";

const navLinks = [
  { label: "Productos", href: "#productos" },
  { label: "Automatización", href: "#categorias" },
  { label: "Iluminación", href: "#categorias" },
  { label: "Cables", href: "#categorias" },
  { label: "Contacto", href: "#contacto" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Top info bar */}
      <div className="bg-primary-dark text-white text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="hidden items-center gap-6 sm:flex">
            <a
              href="tel:5492916431275"
              className="flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <Phone size={14} />
              +54-9-291-643-1275
            </a>
            <a href="tel:5492915051422" className="flex items-center gap-2">
                <Phone size={14} /> +54-9-291-505-1422
            </a>
            <a
              href="mailto:ventas@centrodistribuciones.com.ar"
              className="flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <Mail size={14} />
              ventas@centrodistribuciones.com.ar
            </a>
          </div>
          <div className="mx-auto flex items-center gap-2 text-xs sm:mx-0 sm:text-sm">
            <span>Envíos a todo el país</span>
            <span className="text-primary-light">|</span>
            <span>Distribuidor oficial de marcas líderes</span>
            <span className="text-primary-light">|</span>
            <span>Asesoramiento técnico especializado</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <Image 
              src="/logos/LOGO-CENTRO-DISTRI-CD-CenDist.jpeg" 
              alt="Centro Distribuciones" 
              width={150} 
              height={49}
              className="object-contain"
            />
          </a>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>
            <button
              className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary"
              aria-label="Carrito"
            >
              <ShoppingCart size={20} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                0
              </span>
            </button>
            <a
              href="#contacto"
              className="ml-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Pedir Presupuesto
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="rounded-md p-2 text-gray-700 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 lg:hidden">
            <ul className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="block rounded-md px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-primary/10 hover:text-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3">
              <a
                href="#contacto"
                className="w-full rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                onClick={() => setMenuOpen(false)}
              >
                Pedir Presupuesto
              </a>
            </div>
            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500">
              <a href="tel:5492916431275" className="flex items-center gap-2">
                <Phone size={14} /> +54-9-291-643-1275
              </a>
              <a
                href="mailto:ventas@centrodistribuciones.com.ar"
                className="flex items-center gap-2"
              >
                <Mail size={14} /> ventas@centrodistribuciones.com.ar
              </a>
              <a href="https://www.google.com/maps/place/Centro+Distribuciones+-+ZOLODA+WEG+LCT+SCAME+WTK+CORTEM+GROUP/@-38.7259464,-62.2717194,21z/data=!4m6!3m5!1s0x95edbd92188900d3:0x6e05b12f9cb8361b!8m2!3d-38.7259148!4d-62.2716594!16s%2Fg%2F11jy1r28dk?entry=ttu&g_ep=EgoyMDI2MDIyMy4wIKXMDSoASAFQAw%3D%3D">
                Encontranos en Donado 587, Bahía Blanca, Buenos Aires
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
