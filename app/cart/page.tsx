"use client";

import dynamic from "next/dynamic";

const CartPageServer = dynamic(() => import("./CartPageServer"), { ssr: false });

export default function CartPage() {
  return <CartPageServer />;
}
