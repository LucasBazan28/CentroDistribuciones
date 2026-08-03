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
  metadataBase: new URL("https://www.centrodistribuciones.ar"),
  
  alternates: {
    canonical: "/",
  },
  
  title: "Centro Distribuciones | Distribuidor de Material Eléctrico",
  
  description:
    "Materiales eléctricos para industria y obras. Distribuidor oficial de marcas líderes. Asesoramiento técnico especializado.",
  
  
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
    apple: "/logos/LOGO-CENTRO-DISTRI-CD.png",
  },
  
  openGraph: {
    title:
      "Centro Distribuciones | Distribuidor de Material Eléctrico",
    description:
      "Materiales eléctricos para industria y obras. Distribuidor oficial de marcas líderes. Asesoramiento técnico especializado",
    images: [
      {
        url: "/logos/LOGO-CENTRO-DISTRI-CD-abajo-CentDist.png",
        width: 1200,
        height: 630,
      },
    ],
  },
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