/**
 * palette.ts — Thèmes « clair » et « sombre » de l'Atelier.
 *
 * Une palette = un jeu de tokens (couleurs de l'interface, pilotées en CSS via
 * les variables --color-*) dont on DÉRIVE les couleurs du canevas Konva (qui,
 * lui, ne peut pas lire les variables CSS). Source unique : les tokens.
 * La personnalisation (accent, or) écrase quelques tokens et se répercute
 * automatiquement partout, interface comme canevas.
 */

export type ThemeMode = 'clair' | 'sombre';

export interface ThemeTokens {
  ivory: string;          // fond général
  cream: string;          // panneaux / champs
  surface: string;        // cartes / sidebar
  terracotta: string;     // accent principal (boutons)
  terracottaDark: string; // hover
  blush: string;          // texte accent
  sage: string;           // états OK / botanique
  gold: string;           // filets & ornements
  ink: string;            // texte principal
  muted: string;
  faint: string;
  line: string;
  canvasBg: string;       // fond du canevas
  tableFill: string;      // remplissage des tables
  tableStroke: string;    // contour des tables / sièges occupés
}

export const SOMBRE: ThemeTokens = {
  ivory: '#1e1719',
  cream: '#271f22',
  surface: '#2c2327',
  terracotta: '#a34459',
  terracottaDark: '#8f3a4d',
  blush: '#e0a6b4',
  sage: '#a6b48c',
  gold: '#cca962',
  ink: '#f2e7e0',
  muted: '#b6a29d',
  faint: '#8c7a76',
  line: '#3a2e33',
  canvasBg: '#171114',
  tableFill: '#34282c',
  tableStroke: '#c98b8b',
};

export const CLAIR: ThemeTokens = {
  ivory: '#f7f1e7',
  cream: '#efe7d7',
  surface: '#fffdf8',
  terracotta: '#a34459',
  terracottaDark: '#8a3245',
  blush: '#8a3a4d',
  sage: '#4c7a5b',
  gold: '#b0872f',
  ink: '#2c2320',
  muted: '#6b5f57',
  faint: '#9a8d82',
  line: '#e4d9c6',
  canvasBg: '#f2ebdc',
  tableFill: '#efe6d4',
  tableStroke: '#a34459',
};

export const PRESETS: Record<ThemeMode, ThemeTokens> = { clair: CLAIR, sombre: SOMBRE };

/** Ordre des variables CSS appliquées sur <html>. */
export const CSS_VARS: Record<keyof ThemeTokens, string> = {
  ivory: '--color-ivory',
  cream: '--color-cream',
  surface: '--color-surface',
  terracotta: '--color-terracotta',
  terracottaDark: '--color-terracotta-dark',
  blush: '--color-blush',
  sage: '--color-sage',
  gold: '--color-gold',
  ink: '--color-ink',
  muted: '--color-muted',
  faint: '--color-faint',
  line: '--color-line',
  canvasBg: '--color-canvas-bg',
  tableFill: '--color-table-fill',
  tableStroke: '--color-table-stroke',
};

export interface CanvasPalette {
  bg: string;
  floor: string;
  roomStroke: string;
  gridBold: string;
  gridThin: string;
  tableFill: string;
  tableStroke: string;
  selectStroke: string;
  tableText: string;
  seatOccupied: string;
  seatEmpty: string;
  seatStroke: string;
  seatLabel: string;
  seatLabelAccent: string;
  badgeOk: string;
  badgePlein: string;
  badgeDepass: string;
  dim: string;
  distanceOk: string;
  distanceBad: string;
}

/** Dérive les couleurs du canevas Konva depuis les tokens + le mode. */
export function canvasPalette(t: ThemeTokens, mode: ThemeMode): CanvasPalette {
  const clair = mode === 'clair';
  return {
    bg: t.canvasBg,
    floor: clair ? '#fbf7ef' : '#241c20',
    roomStroke: t.gold,
    gridBold: clair ? '#d6c7ac' : '#4a3a40',
    gridThin: clair ? '#e7ddc9' : '#332a2e',
    tableFill: t.tableFill,
    tableStroke: t.tableStroke,
    selectStroke: t.gold,
    tableText: clair ? t.ink : '#f2e7e0',
    seatOccupied: t.tableStroke,
    seatEmpty: clair ? '#e6dbc6' : '#2b2226',
    seatStroke: clair ? '#c8bca4' : '#6a565c',
    seatLabel: clair ? t.ink : '#e8dcd5',
    seatLabelAccent: t.gold,
    badgeOk: t.sage,
    badgePlein: t.gold,
    badgeDepass: '#d97b6f',
    dim: t.gold,
    distanceOk: t.sage,
    distanceBad: '#e0776a',
  };
}
