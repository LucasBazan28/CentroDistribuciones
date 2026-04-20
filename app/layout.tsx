import type { Metadata } from "next";
import { Archivo_Black, Archivo } from "next/font/google";
// @ts-ignore
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ToastContainer from "./components/Toast";
import { CartProvider } from "./lib/cartContext";
import { ToastProvider } from "./lib/toastProvider";

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
          <CartProvider>
            <Header />
            {children}
            <Footer />
            <ToastContainer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}