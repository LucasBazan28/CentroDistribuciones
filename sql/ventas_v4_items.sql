-- Migración v4: detalle de artículos de cada venta.
-- Ejecutar una sola vez en Supabase (SQL Editor > New query > pegar y "Run"), después de ventas_v3_usd.sql.
-- Es seguro volver a correrla.
--
-- Cada renglón guarda una copia de la descripción y el precio al momento de la venta, así el
-- historial no cambia si después se edita o se borra el artículo del catálogo.
-- articulo_id es opcional para renglones que no están en el catálogo (servicios, mano de obra, etc.).
-- Los importes van siempre en positivo; el signo lo da el tipo de la venta (las NC restan).

create table if not exists public.ventas_items (
  id                  bigint generated always as identity primary key,
  venta_id            bigint not null references public.ventas(id) on delete cascade,
  articulo_id         bigint references public.articulos(id) on delete set null,
  descripcion         text not null check (length(trim(descripcion)) > 0),
  cantidad            numeric(14, 3) not null check (cantidad > 0),
  precio_unitario_ars numeric(14, 2) not null check (precio_unitario_ars >= 0), -- neto, sin IVA
  alicuota_iva        numeric(5, 2) not null default 21 check (alicuota_iva >= 0),
  subtotal_ars        numeric(14, 2) not null check (subtotal_ars >= 0),         -- neto, sin IVA
  created_at          timestamptz not null default now()
);

create index if not exists ventas_items_venta_idx on public.ventas_items (venta_id);
create index if not exists ventas_items_articulo_idx on public.ventas_items (articulo_id);

alter table public.ventas_items enable row level security;

drop policy if exists "Admins gestionan items de ventas" on public.ventas_items;
create policy "Admins gestionan items de ventas" on public.ventas_items
  for all to authenticated
  using (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin'))
  with check (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin'));
