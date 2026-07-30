-- =====================================================================
-- Abonnement Stripe : état de facturation porté par le planner.
--
-- Seul le webhook Stripe (clé secrète Supabase, hors RLS) écrit ces
-- colonnes. Le planner les LIT pour savoir où il en est, mais ne doit
-- jamais pouvoir les modifier : sinon il s'offre l'abonnement avec un
-- simple PATCH REST, la policy planner_self_update (0001) l'y autorisant.
-- =====================================================================

alter table public.planner
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text,
  add column if not exists abo_statut             text,
  add column if not exists abo_fin                timestamptz,
  add column if not exists abo_annule_a_la_fin    boolean not null default false;

-- Un client Stripe ne peut appartenir qu'à un planner.
create unique index if not exists planner_stripe_customer_idx
  on public.planner (stripe_customer_id)
  where stripe_customer_id is not null;

-- Retrouver le planner à partir du client Stripe (chemin chaud du webhook).
create index if not exists planner_stripe_subscription_idx
  on public.planner (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- ---------------------------------------------------------------------
-- Verrou : les colonnes de facturation sont en LECTURE SEULE pour les
-- utilisateurs connectés. Les privilèges par colonne se combinent avec la
-- RLS : la policy autorise la ligne, le GRANT décide des colonnes.
--
-- On liste explicitement les colonnes modifiables (email) plutôt que de
-- révoquer : ainsi toute colonne AJOUTÉE plus tard sera non modifiable par
-- défaut, ce qui est le bon sens de sécurité.
-- ---------------------------------------------------------------------
revoke update on public.planner from authenticated, anon;
grant  update (email) on public.planner to authenticated;

-- ---------------------------------------------------------------------
-- Vue pratique : l'état d'abonnement du planner courant, sans exposer
-- les identifiants Stripe.
-- ---------------------------------------------------------------------
create or replace view public.mon_abonnement
with (security_invoker = true)
as
  select
    p.id,
    p.plan_abo,
    p.abo_statut,
    p.abo_fin,
    p.abo_annule_a_la_fin,
    (p.stripe_customer_id is not null) as a_deja_paye
  from public.planner p
  where p.id = auth.uid();

grant select on public.mon_abonnement to authenticated;

notify pgrst, 'reload schema';
