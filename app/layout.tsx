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
  icons: {
    icon: "/logos/LOGO-CENTRO-DISTRI-CD.png",
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