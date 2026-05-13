import { Send, FileText, Headphones } from "lucide-react";

export default function CTASection() {
  return (
    <section id="contacto" className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light py-20">
      {/* Decorative shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            ¿Necesitás un Presupuesto?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Contactanos y recibí tu cotización personalizada. Precios
            especiales para compras mayoristas, instaladores y empresas.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-8 text-center backdrop-blur-sm transition-colors hover:bg-white/20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white">
              <Send size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">
              Escribinos
            </h3>
            <p className="text-sm text-white/70">
              Envianos tu lista de materiales y te cotizamos en el día.
            </p>
            <a
              href="mailto:distribucionzoloda.bb@gmail.com.ar"
              className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent-dark"
            >
              distribucionzoloda.bb@gmail.com.ar
            </a>
          </div>

          <div className="rounded-2xl bg-white/10 p-8 text-center backdrop-blur-sm transition-colors hover:bg-white/20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white">
              <Headphones size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">
              Llamanos
            </h3>
            <p className="text-sm text-white/70">
              Nuestro equipo comercial te asesora de lunes a viernes.
            </p>
            <a
              href="tel:+54-9-291-643-1275"
              className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent-dark"
            >
              +54-9-291-643-1275
            </a>
          </div>

          <div className="rounded-2xl bg-white/10 p-8 text-center backdrop-blur-sm transition-colors hover:bg-white/20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white">
              <FileText size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">
              Pedí tu Cuenta
            </h3>
            <p className="text-sm text-white/70">
              Abrí tu cuenta de cliente y accedé a precios preferenciales.
            </p>
            <a
              href="/login"
              className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent-dark"
            >
              Registrate aquí
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
