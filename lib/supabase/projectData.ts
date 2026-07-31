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
import { projetRejoint } from './joinLink';
import { projetActif } from './projects';
import { genererToken, hashToken } from '@/lib/shareLink';

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
    .order('id', { ascending: true });
  if (selErr) throw selErr;
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  const anonyme = u?.user?.is_anonymous === true;

  if (existants && existants.length > 0) {
    // RLS renvoie les projets possédés ET partagés. On privilégie un projet
    // POSSÉDÉ (cas planner) ; à défaut, le plus récent partagé (cas mariés).
    // Planner : on rouvre le projet sur lequel il travaillait, sinon le plus
    // récemment modifié. Sans cela, changer de projet n'aurait aucun effet au
    // rechargement.
    const possede = existants.filter(p => p.planner_id === uid);
    if (possede.length > 0) {
      const actif = projetActif();
      const cible = actif ? possede.find(p => p.id === actif) : undefined;
      return (cible ?? possede[0]) as ProjectRow;
    }

    // Invité : ouvrir le projet rejoint par lien plutôt qu'un projet au hasard
    // (un même invité peut avoir plusieurs projets partagés).
    const rejoint = projetRejoint();
    const cible = rejoint ? existants.find(p => p.id === rejoint) : undefined;
    return (cible ?? existants[0]) as ProjectRow;
  }

  // Un invité anonyme n'est pas un planner : il n'a pas de profil dans
  // `planner`, donc créer un projet violerait la clé étrangère. S'il ne voit
  // rien, c'est que son lien a été révoqué ou a expiré.
  if (anonyme) throw new Error('Accès révoqué ou expiré : demandez un nouveau lien.');

  // Aucun projet encore : création via la fonction SECURITY DEFINER (l'INSERT
  // direct est bloqué par un WITH CHECK défaillant en contexte RLS d'écriture).
  const { data, error } = await supabase.rpc('get_or_create_my_project');
  if (error) throw error;
  return data as ProjectRow;
}

// --- Partage planner → mariés (project_share) -------------------------

export interface ShareRow {
  client_email: string;
  role: 'lecture' | 'edition';
}

/** Liste les personnes avec qui le projet est partagé (réservé au planner). */
export async function listShares(
  supabase: SupabaseClient,
  projectId: string,
): Promise<ShareRow[]> {
  const { data, error } = await supabase
    .from('project_share')
    .select('client_email, role')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ShareRow[];
}

/** Invite (ou met à jour le rôle d') un email sur le projet. */
export async function addShare(
  supabase: SupabaseClient,
  projectId: string,
  email: string,
  role: 'lecture' | 'edition',
): Promise<void> {
  const { error } = await supabase
    .from('project_share')
    .upsert({ project_id: projectId, client_email: email.trim().toLowerCase(), role });
  if (error) throw error;
}

/** Retire un email du partage du projet. */
export async function removeShare(
  supabase: SupabaseClient,
  projectId: string,
  email: string,
): Promise<void> {
  const { error } = await supabase
    .from('project_share')
    .delete()
    .eq('project_id', projectId)
    .eq('client_email', email);
  if (error) throw error;
}

// --- Partage par lien privé (project_link) ----------------------------

export interface LinkRow {
  id: string;
  role: 'lecture' | 'edition';
  label: string;
  expires_at: string | null;
  revoked: boolean;
  created_at: string;
}

/** Liste les liens émis pour le projet (réservé au planner). */
export async function listLinks(
  supabase: SupabaseClient,
  projectId: string,
): Promise<LinkRow[]> {
  const { data, error } = await supabase
    .from('project_link')
    .select('id, role, label, expires_at, revoked, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LinkRow[];
}

/**
 * Crée un lien et renvoie le token EN CLAIR, seule et unique occasion de
 * l'afficher : la base n'en garde que le SHA-256.
 */
export async function createLink(
  supabase: SupabaseClient,
  projectId: string,
  role: 'lecture' | 'edition',
  expiresAt: string | null,
  label: string,
): Promise<{ token: string; lien: LinkRow }> {
  const token = genererToken();
  const { data, error } = await supabase
    .from('project_link')
    .insert({
      project_id: projectId,
      token_hash: await hashToken(token),
      role,
      expires_at: expiresAt,
      label,
    })
    .select('id, role, label, expires_at, revoked, created_at')
    .single();
  if (error) throw error;
  return { token, lien: data as LinkRow };
}

/**
 * Supprime un lien. La cascade sur project_member.link_id coupe l'accès de
 * tous ceux qui l'avaient utilisé.
 */
export async function revokeLink(
  supabase: SupabaseClient,
  linkId: string,
): Promise<void> {
  const { error } = await supabase.from('project_link').delete().eq('id', linkId);
  if (error) throw error;
}

/** Invités ayant rejoint le projet par un lien. */
export interface MemberRow {
  user_id: string;
  prenom: string;
  role: 'lecture' | 'edition';
  link_id: string | null;
}

export async function listMembers(
  supabase: SupabaseClient,
  projectId: string,
): Promise<MemberRow[]> {
  const { data, error } = await supabase
    .from('project_member')
    .select('user_id, prenom, role, link_id')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MemberRow[];
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
