-- Migración v3: guarda los importes en U$S de cada comprobante.
-- Ejecutar una sola vez en Supabase (SQL Editor > New query > pegar y "Run"), después de ventas_v2_excel.sql.
-- Es seguro volver a correrla.
--
-- Hasta ahora los U$S se calculaban como importe / dolar. El Excel histórico tiene importes en U$S
-- que no siempre siguen esa cuenta (distintos tipos de cambio usados en cada momento), así que se
-- guardan tal cual. Las ventas nuevas los calculan al registrarse.

alter table public.ventas add column if not exists neto_usd  numeric(16, 6);
alter table public.ventas add column if not exists iva_usd   numeric(16, 6);
alter table public.ventas add column if not exists total_usd numeric(16, 6);

update public.ventas
   set neto_usd  = coalesce(neto_usd,  neto_ars  / dolar),
       iva_usd   = coalesce(iva_usd,   iva_ars   / dolar),
       total_usd = coalesce(total_usd, total_ars / dolar);

alter table public.ventas alter column neto_usd  set not null;
alter table public.ventas alter column iva_usd   set not null;
alter table public.ventas alter column total_usd set not null;
