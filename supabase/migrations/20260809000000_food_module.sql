-- Módulo de comidas (pizzas y hamburguesas)
-- Tabla de productos del menú

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0 check (price >= 0),
  available boolean not null default true,
  created_at timestamptz not null default now()
);

-- Ventas de comida (sin relación con clients, cliente es texto libre)
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  customer text,
  date date not null default current_date,
  total numeric not null default 0 check (total >= 0),
  paid boolean not null default true,
  payment_method text check (payment_method in ('efectivo', 'transferencia')),
  notes text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Gastos del negocio de comidas
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric not null default 0 check (amount >= 0),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Seed de productos del menú
insert into public.products (name, price)
values
  ('Hamburguesa común simple', 4000),
  ('Hamburguesa común doble', 5000),
  ('Hamburguesa especial simple', 5000),
  ('Hamburguesa especial doble', 6000),
  ('Pizza muzarela', 7000),
  ('Pizza napolitana', 8000),
  ('Pizza fugazzeta', 8000),
  ('Pizza jamón y morrón', 8500)
on conflict do nothing;

-- RLS: solo usuarios autenticados pueden leer y escribir
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;

create policy "products authenticated access"
  on public.products for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "sales authenticated access"
  on public.sales for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "expenses authenticated access"
  on public.expenses for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
