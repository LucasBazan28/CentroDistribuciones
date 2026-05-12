"use client";

import { Suspense } from "react";
import CartPageContent from "@/app/components/CartPageContent";

export default function CartPage() {
  return (
    <Suspense fallback={<div>Cargando carrito...</div>}>
      <CartPageContent />
    </Suspense>
  );
}
