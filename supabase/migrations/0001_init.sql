-- =====================================================================
-- Atelier Plan de Table — schéma initial + RLS + Realtime
-- À exécuter dans le SQL Editor de Supabase (une seule fois).
--
-- Modèle : cf. CLAUDE.md. La table « table » du modèle est nommée ici
-- « table_plan » car « table » est un mot réservé SQL (évite de tout
-- quoter). Champs applicatifs supplémentaires vs CLAUDE.md : bouts/verrou
-- (tables), verrou (décor), categorie/evenements (invités), next_table_number
-- (projet). Ils reflètent les entités réelles du store.
-- =====================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- planner : profil du wedding planner, lié 1-1 à auth.users
-- ---------------------------------------------------------------------
create table if not exists public.planner (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  plan_abo   text not null default 'free',
  created_at timestamptz not null default now()
);

-- Création automatique du profil planner à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.planner (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- project
-- ---------------------------------------------------------------------
create table if not exists public.project (
  id                uuid primary key default gen_random_uuid(),
  planner_id        uuid not null references public.planner(id) on delete cascade,
  couple_names      text not null default '',
  salle_w_cm        integer not null default 2000,
  salle_h_cm        integer not null default 1500,
  theme             text,
  accent            text,
  accent2           text,
  next_table_number integer not null default 1,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- project_share : partage planner → mariés (par email)
-- ---------------------------------------------------------------------
create table if not exists public.project_share (
  project_id   uuid not null references public.project(id) on delete cascade,
  client_email text not null,
  role         text not null default 'lecture' check (role in ('lecture','edition')),
  created_at   timestamptz not null default now(),
  primary key (project_id, client_email)
);

-- ---------------------------------------------------------------------
-- guest
-- ---------------------------------------------------------------------
create table if not exists public.guest (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.project(id) on delete cascade,
  nom         text not null,
  menu        text,
  marie       boolean not null default false,
  a_confirmer boolean not null default false,
  categorie   text,
  evenements  jsonb not null default '{}'::jsonb
);

-- ---------------------------------------------------------------------
-- table_plan  (« table » du modèle)
-- ---------------------------------------------------------------------
create table if not exists public.table_plan (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.project(id) on delete cascade,
  nom         text not null,
  shape       text not null check (shape in ('ronde','rect','banquet')),
  diametre_cm integer,
  longueur_cm integer,
  largeur_cm  integer,
  confort     text,
  bouts       boolean not null default false,
  pos_x       double precision not null default 0,
  pos_y       double precision not null default 0,
  rot         double precision not null default 0,
  verrou      boolean not null default false
);

-- ---------------------------------------------------------------------
-- seat
-- ---------------------------------------------------------------------
create table if not exists public.seat (
  id       uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.table_plan(id) on delete cascade,
  index    integer not null,
  guest_id uuid references public.guest(id) on delete set null
);

-- ---------------------------------------------------------------------
-- decor
-- ---------------------------------------------------------------------
create table if not exists public.decor (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.project(id) on delete cascade,
  type       text not null,
  label      text not null default '',
  pos_x      double precision not null default 0,
  pos_y      double precision not null default 0,
  w_cm       integer not null default 100,
  h_cm       integer not null default 100,
  rot        double precision not null default 0,
  verrou     boolean not null default false
);

-- ---------------------------------------------------------------------
-- version : historique (snapshot JSONB)
-- ---------------------------------------------------------------------
create table if not exists public.version (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.project(id) on delete cascade,
  label      text,
  snapshot   jsonb not null,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Helpers d'accès (SECURITY DEFINER pour éviter les récursions de RLS)
-- =====================================================================
create or replace function public.can_read_project(pid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select
    exists (select 1 from public.project p
            where p.id = pid and p.planner_id = auth.uid())
    or exists (select 1 from public.project_share s
               where s.project_id = pid
                 and s.client_email = auth.jwt() ->> 'email');
$$;

create or replace function public.can_edit_project(pid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select
    exists (select 1 from public.project p
            where p.id = pid and p.planner_id = auth.uid())
    or exists (select 1 from public.project_share s
               where s.project_id = pid
                 and s.client_email = auth.jwt() ->> 'email'
                 and s.role = 'edition');
$$;

-- =====================================================================
-- Row-Level Security
-- =====================================================================
alter table public.planner       enable row level security;
alter table public.project       enable row level security;
alter table public.project_share enable row level security;
alter table public.guest         enable row level security;
alter table public.table_plan    enable row level security;
alter table public.seat          enable row level security;
alter table public.decor         enable row level security;
alter table public.version       enable row level security;

-- planner : chacun voit / modifie son propre profil (insert = via trigger)
create policy planner_self_read   on public.planner for select using (id = auth.uid());
create policy planner_self_update on public.planner for update using (id = auth.uid()) with check (id = auth.uid());

-- project
create policy project_read   on public.project for select using (public.can_read_project(id));
create policy project_insert on public.project for insert with check (planner_id = auth.uid());
create policy project_update on public.project for update using (public.can_edit_project(id)) with check (public.can_edit_project(id));
create policy project_delete on public.project for delete using (planner_id = auth.uid());

-- project_share : le planner du projet gère ; le couple lit sa propre ligne
create policy share_owner_all on public.project_share for all
  using      (exists (select 1 from public.project p where p.id = project_id and p.planner_id = auth.uid()))
  with check (exists (select 1 from public.project p where p.id = project_id and p.planner_id = auth.uid()));
create policy share_self_read on public.project_share for select
  using (client_email = auth.jwt() ->> 'email');

-- guest / table_plan / decor / version : accès dérivé du projet
create policy guest_read   on public.guest for select using (public.can_read_project(project_id));
create policy guest_insert on public.guest for insert with check (public.can_edit_project(project_id));
create policy guest_update on public.guest for update using (public.can_edit_project(project_id)) with check (public.can_edit_project(project_id));
create policy guest_delete on public.guest for delete using (public.can_edit_project(project_id));

create policy table_read   on public.table_plan for select using (public.can_read_project(project_id));
create policy table_insert on public.table_plan for insert with check (public.can_edit_project(project_id));
create policy table_update on public.table_plan for update using (public.can_edit_project(project_id)) with check (public.can_edit_project(project_id));
create policy table_delete on public.table_plan for delete using (public.can_edit_project(project_id));

create policy decor_read   on public.decor for select using (public.can_read_project(project_id));
create policy decor_insert on public.decor for insert with check (public.can_edit_project(project_id));
create policy decor_update on public.decor for update using (public.can_edit_project(project_id)) with check (public.can_edit_project(project_id));
create policy decor_delete on public.decor for delete using (public.can_edit_project(project_id));

create policy version_read   on public.version for select using (public.can_read_project(project_id));
create policy version_insert on public.version for insert with check (public.can_edit_project(project_id));
create policy version_delete on public.version for delete using (public.can_edit_project(project_id));

-- seat : accès via la table parente
create policy seat_read on public.seat for select
  using (exists (select 1 from public.table_plan t where t.id = table_id and public.can_read_project(t.project_id)));
create policy seat_insert on public.seat for insert
  with check (exists (select 1 from public.table_plan t where t.id = table_id and public.can_edit_project(t.project_id)));
create policy seat_update on public.seat for update
  using (exists (select 1 from public.table_plan t where t.id = table_id and public.can_edit_project(t.project_id)))
  with check (exists (select 1 from public.table_plan t where t.id = table_id and public.can_edit_project(t.project_id)));
create policy seat_delete on public.seat for delete
  using (exists (select 1 from public.table_plan t where t.id = table_id and public.can_edit_project(t.project_id)));

-- =====================================================================
-- Realtime : diffuser les changements de plan aux clients abonnés
-- =====================================================================
alter table public.project    replica identity full;
alter table public.guest      replica identity full;
alter table public.table_plan replica identity full;
alter table public.seat       replica identity full;
alter table public.decor      replica identity full;

alter publication supabase_realtime add table public.project;
alter publication supabase_realtime add table public.guest;
alter publication supabase_realtime add table public.table_plan;
alter publication supabase_realtime add table public.seat;
alter publication supabase_realtime add table public.decor;
