export interface Product {
  id: number;
  referencia: string;
  descripcion: string;
  precio_unitario: number;
  stock: number;
  categoria_id: number | null;
  marca_id: number | null;
  categorias?: { nombre: string } | null;
  marcas?: { nombre: string } | null;
  grupo_descuento?: { nombre: string; descuento: number } | null;
  precio_venta: number;
  imageURL?: string | null;
  iva: number;
  ganancia: number;
}

export interface Category {
  id: number;
  nombre: string;
}

export interface Brand {
  id: number;
  nombre: string;
}

export interface FilterState {
  category: string | null;
  brand: string | null;
  minPrice: string;
  maxPrice: string;
}