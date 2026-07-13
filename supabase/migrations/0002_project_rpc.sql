-- =====================================================================
-- Atelier Plan de Table — correctif création de projet
--
-- Contexte : sur ce projet Supabase, la policy WITH CHECK d'INSERT sur
-- « project » avec auth.uid() nu (ou même (select auth.uid())) refuse
-- systématiquement (42501), alors que auth.uid() renvoie bien l'uid dans un
-- corps de fonction et dans les policies USING de lecture. On contourne en
-- créant le projet via une fonction SECURITY DEFINER qui valide auth.uid()
-- dans son corps (là où il fonctionne).
-- =====================================================================

-- Pattern recommandé Supabase : (select auth.uid())
drop policy if exists project_insert on public.project;
create policy project_insert on public.project for insert to authenticated
  with check (planner_id = (select auth.uid()));

drop policy if exists project_delete on public.project;
create policy project_delete on public.project for delete to authenticated
  using (planner_id = (select auth.uid()));

-- Création / récupération du projet du planner, sans passer par le WITH CHECK.
create or replace function public.get_or_create_my_project()
returns public.project
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  proj public.project;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  select * into proj from public.project
    where planner_id = uid order by created_at limit 1;
  if not found then
    insert into public.project (planner_id) values (uid) returning * into proj;
  end if;
  return proj;
end;
$$;
grant execute on function public.get_or_create_my_project() to authenticated;

notify pgrst, 'reload schema';
