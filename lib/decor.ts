/**
 * Catalogue des éléments de décor du plan de salle.
 * Dimensions en centimètres (échelle réelle).
 */

export interface DecorPreset {
  type: string;
  label: string;
  wCm: number;
  hCm: number;
  couleur: string;
}

export const DECORS_CATALOG: DecorPreset[] = [
  { type: 'piste', label: 'Piste de danse', wCm: 500, hCm: 500, couleur: '#f1e6ec' },
  { type: 'bar', label: 'Bar', wCm: 300, hCm: 80, couleur: '#e8eee1' },
  { type: 'buffet', label: 'Buffet', wCm: 400, hCm: 100, couleur: '#f2e9d6' },
  { type: 'scene', label: 'Scène', wCm: 500, hCm: 200, couleur: '#f3e3e3' },
  { type: 'entree', label: 'Entrée', wCm: 150, hCm: 40, couleur: '#e6ede2' },
];

export function couleurDecor(type: string): string {
  return DECORS_CATALOG.find(d => d.type === type)?.couleur ?? '#efe7de';
}
