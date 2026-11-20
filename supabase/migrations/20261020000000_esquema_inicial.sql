-- Esquema inicial: directorio de hierberos y catálogo de productos
-- Seguridad: RLS habilitado en todas las tablas (H11, H15). El rol anon solo lee datos públicos.

create table if not exists public.plantas (
  id uuid primary key default gen_random_uuid(),
  nombre_comun text not null unique check (char_length(nombre_comun) between 2 and 60),
  nombre_cientifico text not null check (char_length(nombre_cientifico) between 3 and 80)
);

create table if not exists public.puestos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique references auth.users (id) on delete set null,
  nombre text not null check (char_length(nombre) between 3 and 80),
  tipo text not null check (tipo in ('hierbero', 'tienda')),
  mercado text check (mercado is null or char_length(mercado) <= 80),
  distrito text not null check (char_length(distrito) between 3 and 40),
  direccion text not null check (char_length(direccion) between 5 and 120),
  horario text not null check (char_length(horario) between 3 and 60),
  telefono text check (telefono is null or telefono ~ '^9[0-9]{8}$'),
  creado_en timestamptz not null default now()
);

create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  puesto_id uuid not null references public.puestos (id) on delete cascade,
  planta_id uuid references public.plantas (id) on delete set null,
  nombre text not null check (char_length(nombre) between 2 and 80),
  precio numeric(8, 2) not null check (precio > 0 and precio <= 1000),
  unidad text not null check (unidad in ('atado', '100 g', '250 g', '500 g', '1 kg', 'frasco', 'sobre', 'unidad')),
  stock integer not null default 0 check (stock >= 0 and stock <= 10000),
  procedencia text not null check (char_length(procedencia) between 3 and 80),
  uso_tradicional text check (uso_tradicional is null or char_length(uso_tradicional) <= 400),
  publicado boolean not null default false,
  actualizado_en timestamptz not null default now()
);

create index if not exists productos_puesto_idx on public.productos (puesto_id);
create index if not exists productos_publicado_idx on public.productos (publicado) where publicado;

alter table public.plantas enable row level security;
alter table public.puestos enable row level security;
alter table public.productos enable row level security;

-- Plantas: lectura pública; escritura solo con service_role (sin políticas de escritura).
create policy "plantas_lectura_publica" on public.plantas for select using (true);

-- Puestos: lectura pública; cada hierbero crea/edita solo su puesto.
create policy "puestos_lectura_publica" on public.puestos for select using (true);
create policy "puestos_insert_propio" on public.puestos for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "puestos_update_propio" on public.puestos for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

-- Productos: el público solo ve publicados (H8); el dueño ve y modifica los suyos (H15).
create policy "productos_lectura_publicados" on public.productos for select
  using (publicado = true);
create policy "productos_lectura_propios" on public.productos for select to authenticated
  using (exists (select 1 from public.puestos p where p.id = puesto_id and p.owner_id = (select auth.uid())));
create policy "productos_insert_propio" on public.productos for insert to authenticated
  with check (exists (select 1 from public.puestos p where p.id = puesto_id and p.owner_id = (select auth.uid())));
create policy "productos_update_propio" on public.productos for update to authenticated
  using (exists (select 1 from public.puestos p where p.id = puesto_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.puestos p where p.id = puesto_id and p.owner_id = (select auth.uid())));

-- Marca de tiempo de actualización
create or replace function public.tocar_actualizado_en() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

create trigger productos_actualizado_en before update on public.productos
  for each row execute function public.tocar_actualizado_en();
