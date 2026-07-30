'use client';

/**
 * Accès à un projet par lien privé, côté invité (les mariés).
 *
 * Aucune information sur le lien n'est lisible par une requête directe :
 * `project_link` est fermé par RLS. Tout passe par deux RPC SECURITY DEFINER
 * qui exigent le token en clair (cf. migration 0005).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

/** Clé localStorage : projet rejoint via un lien, à ouvrir en priorité. */
export const CLE_PROJET_REJOINT = 'apt:projet-rejoint';

export interface InfosLien {
  couple_names: string;
  role: 'lecture' | 'edition';
}

/**
 * Aperçu du lien avant de le consommer (nom du couple, rôle accordé).
 * Renvoie null si le lien est inconnu, révoqué ou expiré.
 */
export async function infosLien(
  supabase: SupabaseClient,
  token: string,
): Promise<InfosLien | null> {
  const { data, error } = await supabase.rpc('project_link_infos', { p_token: token });
  if (error) throw error;
  const ligne = Array.isArray(data) ? data[0] : data;
  return ligne ? (ligne as InfosLien) : null;
}

/**
 * Ouvre une session anonyme si besoin, consomme le lien et mémorise le projet
 * rejoint. Renvoie l'id du projet.
 *
 * Une session existante (planner déjà connecté, ou invité revenant sur le
 * lien) est réutilisée telle quelle : inutile de créer un compte anonyme de
 * plus à chaque visite.
 */
export async function rejoindreAvecLien(
  supabase: SupabaseClient,
  token: string,
  prenom = '',
): Promise<string> {
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }

  const { data, error } = await supabase.rpc('redeem_project_link', {
    p_token: token,
    p_prenom: prenom.trim(),
  });
  if (error) throw error;

  const projectId = data as string;
  try { localStorage.setItem(CLE_PROJET_REJOINT, projectId); } catch { /* ignore */ }
  return projectId;
}

/** Projet rejoint par lien lors d'une visite précédente, s'il y en a un. */
export function projetRejoint(): string | null {
  try { return localStorage.getItem(CLE_PROJET_REJOINT); } catch { return null; }
}
