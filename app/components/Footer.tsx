import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { footerProductLinks, footerInfoLinks } from "@/app/lib/navigation";

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">
              Centro Distribuciones
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Distribuidor mayorista de material eléctrico e industrial.
              Más de 40 años ofreciendo soluciones integrales para
              empresas, electricistas e instaladores.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/centrodistribuciones.bb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-gray-400 transition-colors hover:bg-primary hover:text-white"
                aria-label="Instagram"
              >
                <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.69.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/distribucionzoloda.bb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-gray-400 transition-colors hover:bg-primary hover:text-white"
                aria-label="Facebook"
              >
                <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">
              Productos
            </h3>
            <ul className="flex flex-col gap-2.5">
              {footerProductLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">
              Información
            </h3>
            <ul className="flex flex-col gap-2.5">
              {footerInfoLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Contacto</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-primary-light"
                />
                <a
                  href="https://www.google.com/maps/place/Centro+Distribuciones+-+ZOLODA+WEG+LCT+SCAME+WTK+CORTEM+GROUP/@-38.6957312,-62.2362624,13z/data=!4m6!3m5!1s0x95edbd92188900d3:0x6e05b12f9cb8361b!8m2!3d-38.7259148!4d-62.2716594!16s%2Fg%2F11jy1r28dk?entry=ttu&g_ep=EgoyMDI2MDQyMC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  Donado 587, Bahía Blanca,
                  <br />
                  Buenos Aires, Argentina
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-primary-light" />
                <a href="tel:5492916431275" className="text-sm text-gray-400 hover:text-accent">
                  +54-9-291-643-1275
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-primary-light" />
                <a href="tel:5492915051422" className="text-sm text-gray-400 hover:text-accent">
                  +54-9-291-505-1422
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-primary-light" />
                <a
                  href="mailto: distribucionzoloda.bb@gmail.com"
                  className="text-sm text-gray-400 hover:text-accent"
                >
                  distribucionzoloda.bb@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={18} className="shrink-0 text-primary-light" />
                <span className="text-sm text-gray-400">
                  Lun - Vie: 8:00 - 17:00
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Centro Distribuciones. Todos
            los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-gray-300">
              Términos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
