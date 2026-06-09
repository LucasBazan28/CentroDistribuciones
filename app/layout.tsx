import type { Metadata } from "next";
import { Archivo_Black, Archivo } from "next/font/google";
// @ts-ignore
import "./globals.css";
import HeaderWrapper from "./components/HeaderWrapper";
import Footer from "./components/Footer";
import ToastContainer from "./components/Toast";
import { CartProvider } from "./lib/cartContext";
import { ToastProvider } from "./lib/toastProvider";
import { ExchangeRateProvider } from "./lib/exchangeRateContext";
import { Analytics } from "@vercel/analytics/next"
const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-archivo-black",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Centro Distribuciones | Distribuidor de Material Eléctrico e Industrial",
  description:
    "Distribuidor mayorista de material eléctrico e industrial. Automatización, protección, iluminación y cables. Envíos a todo el país.",
  
  keywords: [
    "distribuidor de electricidad",
    "material eléctrico",
    "productos eléctricos",
    "elementos eléctricos",
    "automatización industrial",
    "cables eléctricos",
    "protecciones eléctricas",
  ],
  icons: {
    icon: "/logos/LOGO-CENTRO-DISTRI-CD.png",
  },
  openGraph: {
    title:
      "Centro Distribuciones | Distribuidor de Material Eléctrico",
    description:
      "Más de 40 años distribuyendo material eléctrico en Argentina.",
    images: [
      {
        url: "/logos/LOGO-CENTRO-DISTRI-CD-abajo-CentDist.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  metadataBase: new URL("https://www.centrodistribuciones.ar"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${archivoBlack.variable} ${archivo.variable} antialiased`}
      >
        <ToastProvider>
          <ExchangeRateProvider>
            <CartProvider>
            <HeaderWrapper />
              {children}
              <Analytics />
              <Footer />
              <ToastContainer />
            </CartProvider>
          </ExchangeRateProvider>
        </ToastProvider>
      </body>
    </html>
  );
}