'use client';

/**
 * Couche données Supabase pour un projet : chargement et écriture du plan
 * (salle, tables, décors, invités, sièges). Mapping entre les formes du store
 * (camelCase, cm) et les lignes SQL (snake_case).
 *
 * L'écriture est « full push » debouncée : on upsert toutes les lignes courantes
 * et on supprime celles qui ont disparu. Volume faible (quelques dizaines de
 * lignes) → acceptable. Le diffing fin viendra avec le Realtime (Phase 4).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TableOnPlan, DecorOnPlan } from '@/lib/store/types';
import type { GuestOnPlan, Assignment } from '@/lib/store/guestStore';
import type { TableShape, NiveauConfort } from '@/lib/types';

export interface ProjectRow {
  id: string;
  planner_id: string;
  couple_names: string;
  salle_w_cm: number;
  salle_h_cm: number;
  next_table_number: number;
}

export interface PlanSnapshot {
  salleLargeurCm: number;
  salleHauteurCm: number;
  nextTableNumber: number;
  tables: TableOnPlan[];
  decors: DecorOnPlan[];
  guests: GuestOnPlan[];
  assignments: Record<string, Assignment>;
}

// --- Mapping ligne SQL -> store ---------------------------------------

function rowToTable(r: Record<string, unknown>): TableOnPlan {
  return {
    id: r.id as string,
    nom: r.nom as string,
    shape: r.shape as TableShape,
    diametreCm: (r.diametre_cm as number | null) ?? undefined,
    longueurCm: (r.longueur_cm as number | null) ?? undefined,
    largeurCm: (r.largeur_cm as number | null) ?? undefined,
    confort: (r.confort as NiveauConfort | null) ?? 'standard',
    bouts: (r.bouts as boolean | null) ?? false,
    pos_x: r.pos_x as number,
    pos_y: r.pos_y as number,
    rot: r.rot as number,
    verrou: (r.verrou as boolean | null) ?? false,
    ordre: (r.ordre as number | null) ?? 0,
  };
}

function rowToDecor(r: Record<string, unknown>): DecorOnPlan {
  return {
    id: r.id as string,
    type: r.type as string,
    label: r.label as string,
    pos_x: r.pos_x as number,
    pos_y: r.pos_y as number,
    w_cm: r.w_cm as number,
    h_cm: r.h_cm as number,
    rot: r.rot as number,
    verrou: (r.verrou as boolean | null) ?? false,
    ordre: (r.ordre as number | null) ?? 0,
  };
}

function rowToGuest(r: Record<string, unknown>): GuestOnPlan {
  return {
    id: r.id as string,
    nom: r.nom as string,
    menu: (r.menu as string | null) ?? undefined,
    marie: (r.marie as boolean | null) ?? undefined,
    aConfirmer: (r.a_confirmer as boolean | null) ?? undefined,
    categorie: (r.categorie as GuestOnPlan['categorie']) ?? undefined,
    rang: (r.rang as GuestOnPlan['rang']) ?? undefined,
    evenements: (r.evenements as GuestOnPlan['evenements']) ?? undefined,
  };
}

// --- Mapping store -> ligne SQL ---------------------------------------

function tableToRow(t: TableOnPlan, projectId: string) {
  return {
    id: t.id,
    project_id: projectId,
    nom: t.nom,
    shape: t.shape,
    diametre_cm: t.diametreCm ?? null,
    longueur_cm: t.longueurCm ?? null,
    largeur_cm: t.largeurCm ?? null,
    confort: t.confort ?? null,
    bouts: t.bouts ?? false,
    pos_x: t.pos_x,
    pos_y: t.pos_y,
    rot: t.rot,
    verrou: t.verrou ?? false,
    ordre: t.ordre ?? 0,
  };
}

function decorToRow(d: DecorOnPlan, projectId: string) {
  return {
    id: d.id,
    project_id: projectId,
    type: d.type,
    label: d.label,
    pos_x: d.pos_x,
    pos_y: d.pos_y,
    w_cm: d.w_cm,
    h_cm: d.h_cm,
    rot: d.rot,
    verrou: d.verrou ?? false,
    ordre: d.ordre ?? 0,
  };
}

function guestToRow(g: GuestOnPlan, projectId: string) {
  // NB : la colonne `rang` (VIP/Classique) n'existe pas encore sur cette base
  // Supabase (migration 0004_rang non appliquée). L'inclure faisait échouer TOUT
  // l'enregistrement (PGRST204 « Could not find the 'rang' column »), d'où des
  // modifications non conservées. On l'omet donc de l'écriture ; la lecture
  // (rowToGuest) la tolère (undefined si absente). Réactiver la ligne `rang`
  // ci-dessous une fois la colonne ajoutée en base.
  return {
    id: g.id,
    project_id: projectId,
    nom: g.nom,
    menu: g.menu ?? null,
    marie: g.marie ?? false,
    a_confirmer: g.aConfirmer ?? false,
    categorie: g.categorie ?? null,
    // rang: g.rang ?? null,   // ← à réactiver quand la colonne `rang` existe
    evenements: g.evenements ?? {},
  };
}

// --- Bootstrap : récupérer ou créer le projet du planner --------------

export async function getOrCreateProject(
  supabase: SupabaseClient,
): Promise<ProjectRow> {
  // Sélection DÉTERMINISTE du projet du planner : le plus récemment modifié
  // (celui qui contient le travail), l'id départageant les égalités. Deux
  // projets peuvent partager le même created_at (race au tout premier
  // démarrage) ; s'en remettre au `order by created_at limit 1` de la fonction
  // SQL renvoyait alors l'un OU l'autre au hasard, dispersant les sauvegardes.
  const { data: existants, error: selErr } = await supabase
    .from('project')
    .select('id, planner_id, couple_names, salle_w_cm, salle_h_cm, next_table_number')
    .order('updated_at', { ascending: false })
    .order('id', { ascending: true })
    .limit(1);
  if (selErr) throw selErr;
  if (existants && existants.length > 0) return existants[0] as ProjectRow;

  // Aucun projet encore : création via la fonction SECURITY DEFINER (l'INSERT
  // direct est bloqué par un WITH CHECK défaillant en contexte RLS d'écriture).
  const { data, error } = await supabase.rpc('get_or_create_my_project');
  if (error) throw error;
  return data as ProjectRow;
}

// --- Chargement complet du plan ---------------------------------------

export async function loadPlan(
  supabase: SupabaseClient,
  project: ProjectRow,
): Promise<PlanSnapshot> {
  const [tablesRes, decorsRes, guestsRes] = await Promise.all([
    supabase.from('table_plan').select('*').eq('project_id', project.id).order('ordre', { ascending: true }),
    supabase.from('decor').select('*').eq('project_id', project.id).order('ordre', { ascending: true }),
    supabase.from('guest').select('*').eq('project_id', project.id),
  ]);
  if (tablesRes.error) throw tablesRes.error;
  if (decorsRes.error) throw decorsRes.error;
  if (guestsRes.error) throw guestsRes.error;

  const tables = (tablesRes.data ?? []).map(rowToTable);
  const decors = (decorsRes.data ?? []).map(rowToDecor);
  const guests = (guestsRes.data ?? []).map(rowToGuest);

  const tableIds = tables.map(t => t.id);
  const assignments: Record<string, Assignment> = {};
  if (tableIds.length > 0) {
    const { data: seats, error } = await supabase
      .from('seat')
      .select('table_id, index, guest_id')
      .in('table_id', tableIds);
    if (error) throw error;
    for (const s of seats ?? []) {
      if (s.guest_id) {
        assignments[s.guest_id as string] = {
          tableId: s.table_id as string,
          seatIndex: s.index as number,
        };
      }
    }
  }

  return {
    salleLargeurCm: project.salle_w_cm,
    salleHauteurCm: project.salle_h_cm,
    nextTableNumber: project.next_table_number,
    tables,
    decors,
    guests,
    assignments,
  };
}

/** Recharge le plan à partir du projet id (pour la synchro Realtime). */
export async function fetchPlan(
  supabase: SupabaseClient,
  projectId: string,
): Promise<PlanSnapshot> {
  const { data: pr, error } = await supabase
    .from('project')
    .select('id, planner_id, couple_names, salle_w_cm, salle_h_cm, next_table_number')
    .eq('id', projectId)
    .single();
  if (error) throw error;
  return loadPlan(supabase, pr as ProjectRow);
}

// --- Écriture complète du plan ----------------------------------------

async function upsertAndPrune(
  supabase: SupabaseClient,
  table: 'table_plan' | 'decor' | 'guest',
  projectId: string,
  rows: Array<{ id: string }>,
) {
  if (rows.length > 0) {
    const { error } = await supabase.from(table).upsert(rows);
    if (error) throw error;
  }
  // Supprimer les lignes du projet absentes de l'état courant
  const currentIds = rows.map(r => r.id);
  const { data: existing, error: selErr } = await supabase
    .from(table)
    .select('id')
    .eq('project_id', projectId);
  if (selErr) throw selErr;
  const toDelete = (existing ?? [])
    .map(e => e.id as string)
    .filter(id => !currentIds.includes(id));
  if (toDelete.length > 0) {
    const { error } = await supabase.from(table).delete().in('id', toDelete);
    if (error) throw error;
  }
}

export async function pushPlan(
  supabase: SupabaseClient,
  projectId: string,
  snap: PlanSnapshot,
): Promise<void> {
  // 1. Invités et tables d'abord (les sièges y font référence)
  await upsertAndPrune(supabase, 'guest', projectId, snap.guests.map(g => guestToRow(g, projectId)));
  await upsertAndPrune(supabase, 'table_plan', projectId, snap.tables.map(t => tableToRow(t, projectId)));
  await upsertAndPrune(supabase, 'decor', projectId, snap.decors.map(d => decorToRow(d, projectId)));

  // 2. Champs projet (salle, compteur)
  const { error: projErr } = await supabase
    .from('project')
    .update({
      salle_w_cm: snap.salleLargeurCm,
      salle_h_cm: snap.salleHauteurCm,
      next_table_number: snap.nextTableNumber,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);
  if (projErr) throw projErr;

  // 3. Sièges : purge des places du projet puis réinsertion des occupées
  const tableIds = snap.tables.map(t => t.id);
  if (tableIds.length > 0) {
    const { error: delErr } = await supabase.from('seat').delete().in('table_id', tableIds);
    if (delErr) throw delErr;
  }
  const seatRows = Object.entries(snap.assignments).map(([guestId, a]) => ({
    table_id: a.tableId,
    index: a.seatIndex,
    guest_id: guestId,
  }));
  if (seatRows.length > 0) {
    const { error: insErr } = await supabase.from('seat').insert(seatRows);
    if (insErr) throw insErr;
  }
}
