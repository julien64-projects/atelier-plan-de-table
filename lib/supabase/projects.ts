'use client';

/**
 * projects.ts — Gestion des projets d'un planner (un projet = un mariage).
 *
 * Le quota de l'offre gratuite est appliqué par la base (RPC `create_project`,
 * migration 0007). Les fonctions de ce module s'appuient dessus plutôt que de
 * décider elles-mêmes : une vérification faite ici serait contournable par un
 * appel REST direct. L'interface s'en sert seulement pour prévenir l'utilisateur
 * avant qu'il ne bute dessus.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

/** Projet actuellement ouvert, mémorisé par navigateur. */
export const CLE_PROJET_ACTIF = 'apt:projet-actif';

export interface ProjetResume {
  id: string;
  planner_id: string;
  couple_names: string;
  updated_at: string;
}

/** Message d'erreur renvoyé par la base quand le quota gratuit est atteint. */
export const ERREUR_QUOTA = 'quota_gratuit_atteint';

/** Projets possédés par le planner connecté, du plus récemment modifié au plus ancien. */
export async function listerProjets(
  supabase: SupabaseClient,
  plannerId: string,
): Promise<ProjetResume[]> {
  const { data, error } = await supabase
    .from('project')
    .select('id, planner_id, couple_names, updated_at')
    .eq('planner_id', plannerId)
    .order('updated_at', { ascending: false })
    .order('id', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjetResume[];
}

/**
 * Crée un projet. Lève `ERREUR_QUOTA` si l'offre gratuite est déjà consommée —
 * l'appelant peut alors proposer l'abonnement.
 */
export async function creerProjet(
  supabase: SupabaseClient,
  nom: string,
): Promise<ProjetResume> {
  const { data, error } = await supabase.rpc('create_project', { p_nom: nom.trim() });
  if (error) {
    if (error.message?.includes(ERREUR_QUOTA)) throw new Error(ERREUR_QUOTA);
    throw error;
  }
  return data as ProjetResume;
}

export async function renommerProjet(
  supabase: SupabaseClient,
  id: string,
  nom: string,
): Promise<void> {
  const { error } = await supabase
    .from('project')
    .update({ couple_names: nom.trim(), updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Supprime un projet et tout ce qui en dépend (invités, tables, sièges, décor,
 * liens de partage), par cascade en base. Irréversible : l'appelant doit
 * confirmer.
 */
export async function supprimerProjet(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('project').delete().eq('id', id);
  if (error) throw error;
}

/** Projet ouvert lors de la visite précédente, s'il existe encore. */
export function projetActif(): string | null {
  try { return localStorage.getItem(CLE_PROJET_ACTIF); } catch { return null; }
}

export function definirProjetActif(id: string | null) {
  try {
    if (id) localStorage.setItem(CLE_PROJET_ACTIF, id);
    else localStorage.removeItem(CLE_PROJET_ACTIF);
  } catch { /* ignore */ }
}

/**
 * Nom affichable d'un projet.
 *
 * `couple_names` est vide sur les projets créés automatiquement par les
 * anciennes versions : on retombe alors sur un libellé daté, plutôt que sur
 * une ligne vide impossible à distinguer des autres.
 */
export function nomProjet(p: ProjetResume, sansNom: string): string {
  const nom = (p.couple_names ?? '').trim();
  if (nom) return nom;
  const d = new Date(p.updated_at);
  return Number.isNaN(d.getTime()) ? sansNom : `${sansNom} — ${d.toLocaleDateString()}`;
}

/**
 * Choisit le projet à ouvrir parmi ceux disponibles.
 *
 * Priorité au dernier projet ouvert sur cet appareil ; à défaut le plus
 * récemment modifié. Renvoie null si la liste est vide.
 */
export function projetAOuvrir(
  projets: ProjetResume[],
  memorise: string | null,
): ProjetResume | null {
  if (projets.length === 0) return null;
  return projets.find(p => p.id === memorise) ?? projets[0];
}
