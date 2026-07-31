-- =====================================================================
-- Multi-projets : un planner gère plusieurs mariages.
--
-- Jusqu'ici l'application ne connaissait qu'un projet par planner
-- (`get_or_create_my_project`). Le modèle le permettait déjà — `project`
-- porte un `planner_id` — mais rien ne permettait d'en créer un second.
--
-- Le quota de l'offre gratuite est imposé ICI, dans la base. L'interface
-- le signale, mais seule la base peut l'appliquer : un appel REST direct
-- contournerait une vérification faite côté navigateur.
-- =====================================================================

-- Nombre de projets offerts sans abonnement. Doit rester aligné sur
-- PROJETS_OFFERTS dans lib/stripe/abonnement.ts.
create or replace function public.projets_offerts()
returns integer language sql immutable as $$ select 1 $$;

-- ---------------------------------------------------------------------
-- Création d'un projet, quota compris.
--
-- SECURITY DEFINER pour la même raison qu'en 0002 : sur ce projet, le
-- WITH CHECK d'INSERT sur `project` refuse auth.uid() en contexte
-- d'écriture. La fonction valide l'identité dans son corps, où il
-- fonctionne.
-- ---------------------------------------------------------------------
create or replace function public.create_project(p_nom text default '')
returns public.project
language plpgsql security definer set search_path = public
as $$
declare
  uid    uuid := auth.uid();
  proj   public.project;
  nb     integer;
  abonne boolean;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- Un invité arrivé par lien de partage n'est pas un planner : il n'a pas
  -- de profil et ne doit pas pouvoir créer de projet.
  if not exists (select 1 from public.planner p where p.id = uid) then
    raise exception 'compte non habilité à créer un projet' using errcode = '42501';
  end if;

  select count(*) into nb from public.project where planner_id = uid;
  select (plan_abo = 'pro') into abonne from public.planner where id = uid;

  if not abonne and nb >= public.projets_offerts() then
    raise exception 'quota_gratuit_atteint' using errcode = 'P0001';
  end if;

  insert into public.project (planner_id, couple_names)
  values (uid, coalesce(nullif(trim(p_nom), ''), 'Nouveau mariage'))
  returning * into proj;

  return proj;
end;
$$;

grant execute on function public.create_project(text) to authenticated;
grant execute on function public.projets_offerts() to authenticated;

-- ---------------------------------------------------------------------
-- Compteur pour l'interface : combien de projets, et le quota est-il
-- atteint ? Évite de rapatrier toute la liste juste pour la compter.
-- ---------------------------------------------------------------------
create or replace view public.mes_projets_compte
with (security_invoker = true)
as
  select
    count(*)                                   as nb_projets,
    public.projets_offerts()                   as offerts
  from public.project p
  where p.planner_id = auth.uid();

grant select on public.mes_projets_compte to authenticated;

notify pgrst, 'reload schema';
