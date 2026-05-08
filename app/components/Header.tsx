"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { logoutUser } from "@/lib/auth";
import { useCart } from "@/app/lib/cartContext";
import { useExchangeRate } from "@/app/lib/exchangeRateContext";
import CartDrawer from "./CartDrawer";
import { Phone, Mail, Menu, X, ShoppingCart, Search, UserCircle, LogOut } from "lucide-react";
import CurrencySelector from "./CurrencySelector";
import { headerNavLinks } from "@/app/lib/navigation";
import SearchBar from "./SearchBar";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isProductsPage = pathname.startsWith("/products");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompressed, setIsCompressed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { state: cartState } = useCart();
  const { dollarRate } = useExchangeRate();

  // Sync search query from URL when on products page
  useEffect(() => {
    if (isProductsPage) {
      const searchParam = searchParams.get("search");
      setSearchQuery(searchParam || "");
    }
  }, [isProductsPage, searchParams]);

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

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 150 && scrollY > lastScrollY) {
        setIsCompressed(true);
      } else if (scrollY < 50) {
        setIsCompressed(false);
      }

      setLastScrollY(scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
      {/* Top info bar - Animated with max-height + opacity instead of conditional render */}
      <div
        className="bg-primary-dark text-white text-sm overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isCompressed || isProductsPage ? "0px" : "80px",
          opacity: isCompressed || isProductsPage ? 0 : 1,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="hidden items-center gap-6 sm:flex">
            <a
              href="tel:5492916431275"
              className="flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <Phone size={14} />
              +54-9-291-643-1275
            </a>
            <a
              href="tel:5492915051422"
              className="flex items-center gap-1.5 hover:text-accent transition-colors">
                <Phone size={14} />
                +54-9-291-505-1422
            </a>
            <a
              href="mailto:distribucionzoloda.bb@gmail.com"
              className="flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <Mail size={14} />
              distribucionzoloda.bb@gmail.com
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

      {/* Second section - Logo and main actions / Compressed view */}
      <nav className={`border-b border-gray-200 transition-all duration-300 ${isCompressed && !isProductsPage ? "bg-gray-50" : "bg-white"} ${isCompressed ? "py-2" : (isProductsPage ? "py-2" : "py-4")}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4">
          {/* Logo */}
          <a href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/logos/LOGO-CENTRO-DISTRI-CD-CenDist.jpeg"
              alt="Centro Distribuciones"
              width={(isProductsPage ? 120 : 140)}
              height={(isProductsPage ? 40 : 45)}
              className="object-contain transition-all duration-300"
            />
          </a>

          <div className="flex-1 max-w-2xl">
            {isProductsPage ? (
              <SearchBar
                onSearch={(value) => {
                  router.push(`/products?search=${encodeURIComponent(value)}`);
                }}
                placeholder="Buscar referencia, marca o descripción..."
                compact={true}
                initialValue={searchQuery}
                autoSearch={false}
              />
            ) : (
              <form onSubmit={handleSearch} className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full bg-gray-100 px-4 py-2 pl-10 text-sm text-gray-700 transition-colors placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
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
          </div>

          {/* Expanded view - Full width content ---- OLD SEARCH
          <div className={`hidden lg:flex items-center gap-3 flex-1 transition-all duration-300`}>
            {/* Searchbar 
            {!isProductsPage && (
              <form onSubmit={handleSearch} className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full bg-gray-100 px-4 py-2 pl-10 text-sm text-gray-700 transition-colors placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
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
          </div>*/}

          {/* Right side - Always visible with transitions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">

            {/* Cart button - Always visible */}
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className={`relative rounded-full transition-all duration-300 hover:bg-gray-100 hover:text-primary text-gray-600 ${isCompressed ? "p-1.5" : "p-2"}`}
              aria-label="Carrito"
            >
              <ShoppingCart size={isCompressed ? 18 : 20} />
              {cartState.items.length > 0 && (
                <span className={`absolute flex font-bold text-white rounded-full bg-accent transition-all duration-300 ${isCompressed ? "-right-0.5 -top-0.5 h-3 w-3 text-[8px] items-center justify-center" : "-right-0.5 -top-0.5 h-4 w-4 text-[10px] items-center justify-center"}`}>
                  {cartState.items.length}
                </span>
              )}
            </button>

            {/* Expanded view - Login/Logout/Quote buttons */}
            <div className={`flex items-center gap-3 transition-all duration-300 `}>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500 hover:text-white whitespace-nowrap"
                >
                  <LogOut size={18} />
                  Salir
                </button>
              ) : (
                <a
                  href="/login"
                  className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-primary font-semibold transition-colors hover:bg-primary/10 whitespace-nowrap"
                >
                  <UserCircle size={18} />
                  Iniciar Sesión
                </a>
              )}
              {!isProductsPage && (
                <a
                  href="/cart?quote=true"
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark whitespace-nowrap"
                >
                  Pedir Presupuesto
                </a>
              )}
            </div>

            {/* Compressed view - Dollar rate 
            {isCompressed && dollarRate && (
              <span className="text-xs font-semibold text-gray-700 transition-all duration-300">
                Dólar: ${dollarRate.toFixed(2)}
              </span>
            )}*/}
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

      {/* Third section - Categories and dollar rate - Always visible, never collapses */}
      <nav className="bg-gray-50 border-b border-gray-200 transition-all duration-300 hidden lg:block">
        <div className={`mx-auto max-w-7xl px-4 ${isCompressed ? 'py-1' : 'py-3'}`}>
          <div className="flex items-center justify-between">
            {/* Left spacer */}
            <div className="flex-1" />

            {/* Desktop categories - centered */}
            <ul className="flex items-center gap-1">
              {headerNavLinks.map((link) => (
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

            {/* Right spacer with dollar rate */}
            <div className="flex-1 flex items-center justify-end gap-4">
              <CurrencySelector />
              {dollarRate && (
                <span className="text-sm font-semibold text-gray-700">
                  Dólar: ${dollarRate.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>


      {/* Mobile menu */}
      {menuOpen && (
        <div className="bg-white border-t border-gray-200 px-4 pb-4 lg:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {headerNavLinks.map((link) => (
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
                href="/cart?quote=true"
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
            <div className="w-full flex justify-center py-2 border-t border-gray-100 mt-3">
              <CurrencySelector />
            </div>
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
              <a href="https://www.google.com/maps/place/Centro+Distribuciones+-+ZOLODA+WEG+LCT+SCAME+WTK+CORTEM+GROUP/@-38.6957312,-62.2362624,13z/data=!4m6!3m5!1s0x95edbd92188900d3:0x6e05b12f9cb8361b!8m2!3d-38.7259148!4d-62.2716594!16s%2Fg%2F11jy1r28dk?entry=ttu&g_ep=EgoyMDI2MDQyMC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">
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
