import { describe, it, expect } from 'vitest';
import { nomProjet, projetAOuvrir, type ProjetResume } from '@/lib/supabase/projects';

const projet = (id: string, couple_names: string, updated_at: string): ProjetResume => ({
  id, couple_names, updated_at, planner_id: 'p1',
});

describe('nomProjet', () => {
  it('utilise le nom du couple quand il est renseigné', () => {
    expect(nomProjet(projet('a', 'Camille & Théo', '2026-07-01T10:00:00Z'), 'Sans nom'))
      .toBe('Camille & Théo');
  });

  it('ignore un nom fait uniquement d’espaces', () => {
    const nom = nomProjet(projet('a', '   ', '2026-07-01T10:00:00Z'), 'Sans nom');
    expect(nom.startsWith('Sans nom —')).toBe(true);
  });

  it('date les projets sans nom, pour pouvoir les distinguer', () => {
    // Cas réel : les projets créés automatiquement par les anciennes versions
    // ont un couple_names vide. Sans repli, la liste afficherait plusieurs
    // lignes identiques et vides.
    const a = nomProjet(projet('a', '', '2026-07-01T10:00:00Z'), 'Sans nom');
    const b = nomProjet(projet('b', '', '2026-08-15T10:00:00Z'), 'Sans nom');
    expect(a).not.toBe(b);
    expect(a).toContain('Sans nom');
  });

  it('ne casse pas sur une date illisible', () => {
    expect(nomProjet(projet('a', '', 'pas-une-date'), 'Sans nom')).toBe('Sans nom');
  });
});

describe('projetAOuvrir', () => {
  const liste = [
    projet('recent', 'Récent', '2026-08-01T10:00:00Z'),
    projet('ancien', 'Ancien', '2026-01-01T10:00:00Z'),
  ];

  it('rouvre le projet mémorisé sur cet appareil', () => {
    expect(projetAOuvrir(liste, 'ancien')?.id).toBe('ancien');
  });

  it('retombe sur le premier de la liste si le projet mémorisé a disparu', () => {
    // Cas d'un projet supprimé depuis un autre appareil.
    expect(projetAOuvrir(liste, 'supprime')?.id).toBe('recent');
  });

  it('retombe sur le premier quand rien n’est mémorisé', () => {
    expect(projetAOuvrir(liste, null)?.id).toBe('recent');
  });

  it('renvoie null quand le planner n’a aucun projet', () => {
    expect(projetAOuvrir([], 'peu-importe')).toBeNull();
  });
});
