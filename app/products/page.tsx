"use client";

import dynamic from "next/dynamic";

const ProductsPageContent = dynamic(
  () => import("./ProductsPageContent"),
  { ssr: false }
);

export default function ProductsPage() {
  return <ProductsPageContent />;
}
