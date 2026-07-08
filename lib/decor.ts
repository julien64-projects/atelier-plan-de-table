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
  { type: 'piste', label: 'Piste de danse', wCm: 500, hCm: 500, couleur: '#e7ddf3' },
  { type: 'bar', label: 'Bar', wCm: 300, hCm: 80, couleur: '#d6e6f0' },
  { type: 'buffet', label: 'Buffet', wCm: 400, hCm: 100, couleur: '#f0e6d6' },
  { type: 'scene', label: 'Scène', wCm: 500, hCm: 200, couleur: '#f0d6d6' },
  { type: 'entree', label: 'Entrée', wCm: 150, hCm: 40, couleur: '#dce8dc' },
];

export function couleurDecor(type: string): string {
  return DECORS_CATALOG.find(d => d.type === type)?.couleur ?? '#e5e0d8';
}
