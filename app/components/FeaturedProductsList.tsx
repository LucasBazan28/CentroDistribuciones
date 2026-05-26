"use client";

import { Product } from "@/app/lib/types";
import { useCart } from "@/app/lib/cartContext";
import { useExchangeRate } from "@/app/lib/exchangeRateContext";
import { useToast } from "@/app/lib/toastProvider";
import ProductCard from "./ProductCard";

interface FeaturedProductsListProps {
  products: Product[];
}

export default function FeaturedProductsList({
  products,
}: FeaturedProductsListProps) {
  const { addItem } = useCart();
  const { formatPrice } = useExchangeRate();
  const { addToast } = useToast();

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    addToast(`${product.referencia} agregado al carrito`, "success");
  };

  return (
    <>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          formatPrice={formatPrice}
        />
      ))}
    </>
  );
}
