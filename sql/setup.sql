-- ============================================================
-- NutriControle Pro 6.1 — Setup Supabase
-- Execute no SQL Editor do Supabase (uma única vez)
-- ============================================================

-- 1. PERFIS (altura, idade, sexo — dados permanentes do usuário)
create table if not exists perfis (
  id              uuid references auth.users on delete cascade primary key,
  altura          numeric,
  idade           numeric,
  sexo            text,
  nivel_atividade text default 'sedentario',
  objetivo        text default 'manter',
  updated_at      timestamptz default now()
);
alter table perfis enable row level security;
create policy "perfis_own" on perfis for all using (auth.uid() = id);

-- 2. REGISTROS DIÁRIOS (peso, glicose, pressão, IMC)
create table if not exists registros_diarios (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users on delete cascade not null,
  data            date not null,
  peso            numeric,
  glicose         numeric,
  ps              numeric,
  pd              numeric,
  nivel_atividade text,
  objetivo        text,
  imc             numeric,
  updated_at      timestamptz default now(),
  unique (user_id, data)
);
alter table registros_diarios enable row level security;
create policy "registros_own" on registros_diarios for all using (auth.uid() = user_id);

-- 3. REFEIÇÕES (itens do diário alimentar por data e refeição)
create table if not exists refeicoes (
  id        uuid default gen_random_uuid() primary key,
  user_id   uuid references auth.users on delete cascade not null,
  data      date not null,
  refeicao  text not null,
  itens     jsonb default '[]',
  updated_at timestamptz default now(),
  unique (user_id, data, refeicao)
);
alter table refeicoes enable row level security;
create policy "refeicoes_own" on refeicoes for all using (auth.uid() = user_id);

-- 4. ALIMENTOS PERSONALIZADOS
create table if not exists alimentos_personalizados (
  id        uuid default gen_random_uuid() primary key,
  user_id   uuid references auth.users on delete cascade not null,
  nome      text not null,
  proteina  numeric default 0,
  carbo     numeric default 0,
  gordura   numeric default 0,
  calorias  numeric default 0,
  fonte     text default 'PERSONALIZADO',
  unique (user_id, nome)
);
alter table alimentos_personalizados enable row level security;
create policy "alimentos_own" on alimentos_personalizados for all using (auth.uid() = user_id);
