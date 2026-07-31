-- =====================================================================
-- Aligner la règle d'accès SQL sur celle de l'application.
--
-- Défaut constaté en test : à la résiliation, le webhook remet
-- plan_abo='free' immédiatement, alors que `abo_fin` court encore. Or
-- lib/stripe/abonnement.ts honore la période déjà réglée. Résultat :
-- l'interface annonçait « abonné jusqu'au 31/08 » et proposait de créer un
-- projet, pendant que create_project() refusait — message d'erreur
-- incompréhensible pour le client, au pire moment (il vient de payer).
--
-- La base devient la référence unique, avec la MÊME règle des deux côtés.
-- =====================================================================

/**
 * Miroir SQL de `abonnementActif()`. Toute évolution doit être répercutée
 * dans lib/stripe/abonnement.ts, et inversement.
 */
create or replace function public.abonnement_actif(
  p_statut text,
  p_fin    timestamptz
)
returns boolean
language sql immutable
as $$
  select case
    when p_statut is null then false
    -- Paiement initial non abouti, ou abonnement suspendu : aucun accès.
    when p_statut in ('incomplete', 'incomplete_expired', 'paused') then false
    -- En règle : accès, borné par la fin de période si elle est connue.
    when p_statut in ('active', 'trialing') then (p_fin is null or p_fin > now())
    -- Impayé ou résilié : on honore la période déjà réglée, pas au-delà.
    when p_statut in ('past_due', 'unpaid', 'canceled') then (p_fin is not null and p_fin > now())
    else false
  end;
$$;

grant execute on function public.abonnement_actif(text, timestamptz) to authenticated;

-- Création de projet : même règle que l'interface.
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

  if not exists (select 1 from public.planner p where p.id = uid) then
    raise exception 'compte non habilité à créer un projet' using errcode = '42501';
  end if;

  select count(*) into nb from public.project where planner_id = uid;

  select public.abonnement_actif(abo_statut, abo_fin)
    into abonne
    from public.planner
   where id = uid;

  if not coalesce(abonne, false) and nb >= public.projets_offerts() then
    raise exception 'quota_gratuit_atteint' using errcode = 'P0001';
  end if;

  insert into public.project (planner_id, couple_names)
  values (uid, coalesce(nullif(trim(p_nom), ''), 'Nouveau mariage'))
  returning * into proj;

  return proj;
end;
$$;

grant execute on function public.create_project(text) to authenticated;

notify pgrst, 'reload schema';
