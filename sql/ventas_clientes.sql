-- Tablas para registrar clientes y ventas desde el panel de administración.
-- Ejecutar una sola vez en Supabase: SQL Editor > New query > pegar y "Run".

create table if not exists public.clientes (
  id           bigint generated always as identity primary key,
  cuit         varchar(11) not null unique check (cuit ~ '^[0-9]{11}$'),
  razon_social text not null,
  email        text,
  telefono     text,
  direccion    text,
  created_at   timestamptz not null default now()
);

-- Los importes se guardan siempre en positivo; las notas de crédito restan
-- según la columna "tipo". Los valores en U$S se calculan como importe / dolar.
create table if not exists public.ventas (
  id              bigint generated always as identity primary key,
  tipo            text not null default 'factura' check (tipo in ('factura', 'nota_credito')),
  nro_comprobante varchar(8) not null check (nro_comprobante ~ '^[0-9]{8}$'),
  fecha           date not null,
  cliente_id      bigint not null references public.clientes(id) on delete restrict,
  neto_ars        numeric(14, 2) not null check (neto_ars >= 0),
  iva_ars         numeric(14, 2) not null check (iva_ars >= 0),
  total_ars       numeric(14, 2) not null check (total_ars >= 0),
  dolar           numeric(10, 2) not null check (dolar > 0),
  observacion     text,
  created_at      timestamptz not null default now(),
  unique (tipo, nro_comprobante)
);

create index if not exists ventas_fecha_idx on public.ventas (fecha);
create index if not exists ventas_cliente_idx on public.ventas (cliente_id);

-- Solo los administradores pueden leer y escribir estas tablas.
alter table public.clientes enable row level security;
alter table public.ventas enable row level security;

drop policy if exists "Admins gestionan clientes" on public.clientes;
create policy "Admins gestionan clientes" on public.clientes
  for all to authenticated
  using (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin'))
  with check (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin'));

drop policy if exists "Admins gestionan ventas" on public.ventas;
create policy "Admins gestionan ventas" on public.ventas
  for all to authenticated
  using (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin'))
  with check (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin'));
