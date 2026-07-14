-- =====================================================================
-- Rang du foyer (VIP / Classique) pour le récapitulatif des présences.
-- =====================================================================

alter table public.guest add column if not exists rang text;

notify pgrst, 'reload schema';
