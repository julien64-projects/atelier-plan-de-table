-- =====================================================================
-- Partage par lien privé (planner → mariés), sans compte ni mot de passe.
--
-- Principe : le planner crée un lien porteur d'un token de 128 bits. Les
-- mariés l'ouvrent, obtiennent une session ANONYME Supabase, et la RPC
-- `redeem_project_link` les rattache au projet via `project_member`.
--
-- Le token n'est jamais stocké en clair : seul son SHA-256 est en base.
--
-- Point d'appui : les deux helpers can_read_project / can_edit_project sont
-- traversés par TOUTES les policies (guest, table_plan, seat, decor,
-- version). Y ajouter project_member suffit à ouvrir tout le plan aux
-- invités par lien, Realtime compris, sans toucher aux policies elles-mêmes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. PRÉREQUIS — trigger compatible avec les comptes anonymes
--
-- handle_new_user (0001) insère new.email dans planner.email qui est NOT
-- NULL. Un compte anonyme n'a pas d'email : le trigger échouerait et
-- signInAnonymously() renverrait une 500. Un invité anonyme n'est pas un
-- planner, on ne lui crée donc pas de profil.
--
-- À faire aussi dans le dashboard : Authentication → Providers → activer
-- « Anonymous sign-ins ».
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null or new.email = '' then
    return new;  -- invité anonyme (lien de partage) : pas de profil planner
  end if;
  insert into public.planner (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1. project_link : les liens d'invitation émis par le planner
-- ---------------------------------------------------------------------
create table if not exists public.project_link (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.project(id) on delete cascade,
  token_hash  text not null unique,
  role        text not null default 'lecture' check (role in ('lecture','edition')),
  label       text not null default '',
  expires_at  timestamptz,
  revoked     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists project_link_project_idx on public.project_link (project_id);

-- ---------------------------------------------------------------------
-- 2. project_member : qui a effectivement rejoint, via quel lien
--
-- link_id ON DELETE CASCADE : supprimer un lien coupe l'accès de tous ceux
-- qui l'ont utilisé. C'est le mécanisme de révocation.
-- ---------------------------------------------------------------------
create table if not exists public.project_member (
  project_id uuid not null references public.project(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('lecture','edition')),
  link_id    uuid references public.project_link(id) on delete cascade,
  prenom     text not null default '',
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index if not exists project_member_user_idx on public.project_member (user_id);

-- ---------------------------------------------------------------------
-- 3. Helpers d'accès étendus aux membres par lien
--
-- SECURITY DEFINER : la lecture de project_member ici ne repasse pas par
-- la RLS, donc pas de récursion de policy.
-- ---------------------------------------------------------------------
create or replace function public.can_read_project(pid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select
    exists (select 1 from public.project p
            where p.id = pid and p.planner_id = auth.uid())
    or exists (select 1 from public.project_share s
               where s.project_id = pid
                 and s.client_email = auth.jwt() ->> 'email')
    or exists (select 1 from public.project_member m
               where m.project_id = pid
                 and m.user_id = auth.uid());
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
                 and s.role = 'edition')
    or exists (select 1 from public.project_member m
               where m.project_id = pid
                 and m.user_id = auth.uid()
                 and m.role = 'edition');
$$;

-- ---------------------------------------------------------------------
-- 4. RLS des deux nouvelles tables
-- ---------------------------------------------------------------------
alter table public.project_link   enable row level security;
alter table public.project_member enable row level security;

-- project_link : réservé au planner propriétaire. Les invités n'ont AUCUN
-- accès en lecture — inutile pour eux, et ça garde les hachés hors de portée.
drop policy if exists project_link_owner_all on public.project_link;
create policy project_link_owner_all on public.project_link for all to authenticated
  using      (exists (select 1 from public.project p
                      where p.id = project_id and p.planner_id = (select auth.uid())))
  with check (exists (select 1 from public.project p
                      where p.id = project_id and p.planner_id = (select auth.uid())));

-- project_member : le planner voit et gère les membres de ses projets ;
-- chaque invité lit sa propre ligne (pour connaître son rôle).
drop policy if exists project_member_owner_all on public.project_member;
create policy project_member_owner_all on public.project_member for all to authenticated
  using      (exists (select 1 from public.project p
                      where p.id = project_id and p.planner_id = (select auth.uid())))
  with check (exists (select 1 from public.project p
                      where p.id = project_id and p.planner_id = (select auth.uid())));

drop policy if exists project_member_self_read on public.project_member;
create policy project_member_self_read on public.project_member for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 5. RPC : consommer un lien
--
-- SECURITY DEFINER car l'appelant ne peut pas lire project_link. Le seul
-- moyen d'obtenir un accès est de présenter un token dont le SHA-256
-- correspond à une ligne active.
--
-- search_path inclut `extensions` : digest() vient de pgcrypto, que Supabase
-- installe dans ce schéma (mais parfois dans public selon l'âge du projet).
-- ---------------------------------------------------------------------
create or replace function public.redeem_project_link(p_token text, p_prenom text default '')
returns uuid
language plpgsql security definer set search_path = public, extensions
as $$
declare
  uid    uuid := auth.uid();
  lien   public.project_link;
  nouveau text := coalesce(trim(p_prenom), '');
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- Le token doit être bien formé avant toute recherche.
  if p_token is null or p_token !~ '^[0-9a-f]{32}$' then
    raise exception 'lien invalide' using errcode = '22023';
  end if;

  select * into lien from public.project_link
   where token_hash = encode(digest(p_token, 'sha256'), 'hex')
     and not revoked
     and (expires_at is null or expires_at > now());

  if not found then
    raise exception 'lien invalide ou expiré' using errcode = '22023';
  end if;

  -- Le planner propriétaire n'a pas besoin d'être membre de son projet.
  if exists (select 1 from public.project p
             where p.id = lien.project_id and p.planner_id = uid) then
    return lien.project_id;
  end if;

  insert into public.project_member (project_id, user_id, role, link_id, prenom)
  values (lien.project_id, uid, lien.role, lien.id, nouveau)
  on conflict (project_id, user_id) do update
    set role    = excluded.role,
        link_id = excluded.link_id,
        prenom  = case when excluded.prenom <> '' then excluded.prenom
                       else public.project_member.prenom end;

  return lien.project_id;
end;
$$;

grant execute on function public.redeem_project_link(text, text) to authenticated;

-- ---------------------------------------------------------------------
-- 6. Nom du projet lisible par un invité avant même d'avoir rejoint
--    (affichage « Vous rejoignez le mariage de … » sur la page /rejoindre)
-- ---------------------------------------------------------------------
create or replace function public.project_link_infos(p_token text)
returns table (couple_names text, role text)
language plpgsql stable security definer set search_path = public, extensions
as $$
begin
  if p_token is null or p_token !~ '^[0-9a-f]{32}$' then
    return;
  end if;
  return query
    select p.couple_names, l.role
      from public.project_link l
      join public.project p on p.id = l.project_id
     where l.token_hash = encode(digest(p_token, 'sha256'), 'hex')
       and not l.revoked
       and (l.expires_at is null or l.expires_at > now());
end;
$$;

grant execute on function public.project_link_infos(text) to anon, authenticated;

notify pgrst, 'reload schema';
