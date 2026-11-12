-- Migración v2: adapta clientes y ventas a todos los casos del Excel "Control Facturación".
-- Ejecutar una sola vez en Supabase (SQL Editor > New query > pegar y "Run"),
-- después de ventas_clientes.sql. Es seguro volver a correrla.
--
-- Cambios:
--  * Tipos de comprobante como en el Excel: A, B, M, FC (factura de crédito), NC, ND.
--  * Los importes se guardan con signo, igual que en el Excel (las NC en negativo),
--    así los totales se obtienen sumando directamente.
--  * El cliente es opcional (facturas B a consumidor final sin identificar).
--  * El CUIT del cliente es opcional (consumidores finales identificados solo por nombre).
--  * El número de comprobante puede repetirse dentro de un tipo (cambios de punto de venta);
--    la app avisa y pide confirmación antes de cargar un número repetido.

-- ---------- clientes ----------
alter table public.clientes alter column cuit drop not null;
alter table public.clientes drop constraint if exists clientes_cuit_check;
alter table public.clientes add constraint clientes_cuit_check check (cuit is null or cuit ~ '^[0-9]{11}$');

-- ---------- ventas ----------
alter table public.ventas drop constraint if exists ventas_tipo_check;
alter table public.ventas drop constraint if exists ventas_neto_ars_check;
alter table public.ventas drop constraint if exists ventas_iva_ars_check;
alter table public.ventas drop constraint if exists ventas_total_ars_check;
alter table public.ventas drop constraint if exists ventas_tipo_nro_comprobante_key;

-- Las notas de crédito pasan a guardarse en negativo (solo las que todavía tienen el tipo viejo,
-- así correr el script dos veces no invierte el signo de nuevo).
update public.ventas
   set neto_ars = -abs(neto_ars), iva_ars = -abs(iva_ars), total_ars = -abs(total_ars)
 where tipo = 'nota_credito';

update public.ventas set tipo = 'A'  where tipo = 'factura';
update public.ventas set tipo = 'NC' where tipo = 'nota_credito';

alter table public.ventas alter column tipo set default 'A';
alter table public.ventas add constraint ventas_tipo_check check (tipo in ('A', 'B', 'M', 'FC', 'NC', 'ND'));
alter table public.ventas alter column cliente_id drop not null;

create index if not exists ventas_tipo_nro_idx on public.ventas (tipo, nro_comprobante);
