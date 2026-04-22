import { MapPin, Phone, Mail, Clock } from "lucide-react";

const quickLinks = [
  { label: "Todos los Productos", href: "#productos" },
  { label: "Automatización", href: "#categorias" },
  { label: "Protección y Maniobra", href: "#categorias" },
  { label: "Iluminación", href: "#categorias" },
  { label: "Cables", href: "#categorias" },
];

const infoLinks = [
  { label: "Sobre Nosotros", href: "#" },
  { label: "Términos y Condiciones", href: "#" },
  { label: "Preguntas Frecuentes", href: "#" },
  { label: "Política de Envíos", href: "#" },
  { label: "Trabaja con Nosotros", href: "#" },
];

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
              Más de 30 años ofreciendo soluciones integrales para
              empresas, electricistas e instaladores.
            </p>
            <div className="flex gap-3">
              {["LinkedIn", "Instagram", "Facebook", "YouTube"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-gray-400 transition-colors hover:bg-primary hover:text-white"
                    aria-label={social}
                  >
                    {social.charAt(0)}
                  </a>
                )
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">
              Productos
            </h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
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
              {infoLinks.map((link) => (
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
                  href="mailto:ventas@centrodistribuciones.com.ar"
                  className="text-sm text-gray-400 hover:text-accent"
                >
                  ventas@centrodistribuciones.com.ar
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
