-- =====================================================================
-- Ordre d'empilement (z-order) partagé entre tables et décors.
-- Le dernier élément ajouté reçoit l'ordre le plus élevé → dessiné au-dessus.
-- Défaut 0 : les données existantes gardent l'ordre d'insertion (les tables
-- passent au-dessus des décors à ordre égal, géré côté rendu).
-- =====================================================================

alter table public.table_plan add column if not exists ordre integer not null default 0;
alter table public.decor      add column if not exists ordre integer not null default 0;

notify pgrst, 'reload schema';
