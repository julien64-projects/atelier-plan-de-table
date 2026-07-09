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
  { type: 'piste', label: 'Piste de danse', wCm: 500, hCm: 500, couleur: '#3a2e37' },
  { type: 'bar', label: 'Bar', wCm: 300, hCm: 80, couleur: '#2e3a2e' },
  { type: 'buffet', label: 'Buffet', wCm: 400, hCm: 100, couleur: '#3a3220' },
  { type: 'scene', label: 'Scène', wCm: 500, hCm: 200, couleur: '#3a2b2e' },
  { type: 'entree', label: 'Entrée', wCm: 150, hCm: 40, couleur: '#2c3730' },
];

export function couleurDecor(type: string): string {
  return DECORS_CATALOG.find(d => d.type === type)?.couleur ?? '#2f272b';
}
