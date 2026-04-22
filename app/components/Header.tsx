"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { logoutUser } from "@/lib/auth";
import { useCart } from "@/app/lib/cartContext";
import { useExchangeRate } from "@/app/lib/exchangeRateContext";
import CartDrawer from "./CartDrawer";
import {
  Phone,
  Mail,
  Menu,
  X,
  ShoppingCart,
  Search,
  UserCircle,
  LogOut,
} from "lucide-react";

const navLinks = [
  { label: "Productos", href: "/products" },
  { label: "Automatización", href: "#categorias" },
  { label: "Iluminación", href: "#categorias" },
  { label: "Cables", href: "#categorias" },
  { label: "Contacto", href: "#contacto" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isProductsPage = pathname.startsWith("/products");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { state: cartState } = useCart();
  const { dollarRate } = useExchangeRate();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Top info bar - Hidden on products page */}
      {!isProductsPage && (
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
      )}

      {/* Second section - Logo and main actions */}
      <nav className={`bg-white border-b border-gray-200 ${isProductsPage ? "py-2" : "py-4"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          {/* Logo - Smaller on products page */}
          <a href="/" className="flex items-center gap-2">
            <Image
              src="/logos/LOGO-CENTRO-DISTRI-CD-CenDist.jpeg"
              alt="Centro Distribuciones"
              width={isProductsPage ? 100 : 150}
              height={isProductsPage ? 33 : 49}
              className="object-contain"
            />
          </a>

          {/* Desktop actions - Search, Cart, Login, Quote */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* Searchbar - Hidden on products page */}
            {!isProductsPage && (
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-full bg-gray-100 px-4 py-2 pl-10 text-sm text-gray-700 transition-colors placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-primary"
                  aria-label="Buscar"
                >
                  <Search size={18} />
                </button>
              </form>
            )}
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary"
              aria-label="Carrito"
            >
              <ShoppingCart size={20} />
              {cartState.items.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {cartState.items.length}
                </span>
              )}
            </button>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500 hover:text-white"
              >
                <LogOut size={18} />
                Salir
              </button>
            ) : (
              <a
                href="/login"
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-primary font-semibold transition-colors hover:bg-primary/10"
              >
                <UserCircle size={18} />
                Iniciar Sesión
              </a>
            )}
            {!isProductsPage && (
              <a
                href="#contacto"
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Pedir Presupuesto
              </a>
            )}
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
      </nav>

      {/* Third section - Categories and dollar rate - Hidden on products page */}
      {!isProductsPage && (
        <nav className="bg-gray-50 border-b border-gray-200">
          <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3">
            {/* Desktop categories - centered */}
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

            {/* Dollar rate - positioned at right */}
            <div className="absolute right-4">
              {dollarRate && (
                <span className="text-sm font-semibold text-gray-700">
                  Dólar: ${dollarRate.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="bg-white border-t border-gray-200 px-4 pb-4 lg:hidden">
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
          <div className="mt-3 flex flex-col items-center gap-3 border-t border-gray-100 pt-3">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500 px-5 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500 hover:text-white"
              >
                <LogOut size={18} />
                Salir
              </button>
            ) : (
              <a
                href="/login"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-primary font-semibold transition-colors hover:bg-primary/10"
                onClick={() => setMenuOpen(false)}
              >
                <UserCircle size={18} />
                Iniciar Sesión
              </a>
            )}
            {!isProductsPage && (
              <a
                href="#contacto"
                className="w-full rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                onClick={() => setMenuOpen(false)}
              >
                Pedir Presupuesto
              </a>
            )}
            {dollarRate && (
              <span className="text-sm font-semibold text-gray-700">
                Dólar: ${dollarRate.toFixed(2)}
              </span>
            )}
          </div>
          {!isProductsPage && (
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
          )}
        </div>
      )}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </header>
  );
}
