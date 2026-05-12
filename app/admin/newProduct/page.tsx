"use client";

import dynamic from "next/dynamic";

const NewProductPageContent = dynamic(
  () => import("./NewProductPageContent"),
  { ssr: false }
);

export default function NewProductPage() {
  return <NewProductPageContent />;
}
