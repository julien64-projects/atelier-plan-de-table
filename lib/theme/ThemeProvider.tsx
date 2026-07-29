'use client';

/**
 * Contexte de thème : mode clair/sombre + personnalisation de l'accent et de
 * l'or. Applique les tokens sur <html> via les variables CSS (interface) et
 * expose la palette dérivée pour le canevas Konva. Persisté en localStorage.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  PRESETS,
  CSS_VARS,
  canvasPalette,
  type ThemeMode,
  type ThemeTokens,
  type CanvasPalette,
} from './palette';

interface Personnalisation {
  terracotta?: string;
  gold?: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  accent: string;        // couleur d'accent effective (terracotta)
  gold: string;          // couleur des filets effective
  setAccent: (c: string) => void;
  setGold: (c: string) => void;
  reinitialiser: () => void;
  personnalise: boolean;
  canvas: CanvasPalette;
}

const KEY = 'apt:theme:v1';

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface Stored {
  mode: ThemeMode;
  perso: Personnalisation;
}

function lire(): Stored {
  if (typeof window === 'undefined') return { mode: 'sombre', perso: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      const mode: ThemeMode = d.mode === 'clair' ? 'clair' : 'sombre';
      return { mode, perso: d.perso ?? {} };
    }
  } catch { /* ignore */ }
  return { mode: 'sombre', perso: {} };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('sombre');
  const [perso, setPerso] = useState<Personnalisation>({});

  // Refs toujours à jour, pour persister depuis les setters (et non un effet
  // réactif, qui provoquait une course avec l'hydratation).
  const modeRef = useRef(mode);
  const persoRef = useRef(perso);
  modeRef.current = mode;
  persoRef.current = perso;

  const persist = (m: ThemeMode, p: Personnalisation) => {
    try { localStorage.setItem(KEY, JSON.stringify({ mode: m, perso: p })); } catch { /* ignore */ }
  };

  // Hydratation depuis localStorage (une fois, côté client) — ne persiste pas.
  useEffect(() => {
    const { mode: m, perso: p } = lire();
    setModeState(m);
    setPerso(p);
  }, []);

  // Tokens effectifs = preset du mode + personnalisation
  const tokens: ThemeTokens = useMemo(() => {
    const base = PRESETS[mode];
    return {
      ...base,
      terracotta: perso.terracotta ?? base.terracotta,
      gold: perso.gold ?? base.gold,
    };
  }, [mode, perso]);

  // Applique les variables CSS sur <html> (jamais de persistance ici)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset.theme = mode;
    (Object.keys(CSS_VARS) as (keyof ThemeTokens)[]).forEach(k => {
      root.style.setProperty(CSS_VARS[k], tokens[k]);
    });
    root.style.setProperty('--background', tokens.ivory);
    root.style.setProperty('--foreground', tokens.ink);
  }, [mode, tokens]);

  // Persistance UNIQUEMENT sur action utilisateur
  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    persist(m, persoRef.current);
  }, []);
  const setAccent = useCallback((c: string) => {
    setPerso(p => { const np = { ...p, terracotta: c }; persist(modeRef.current, np); return np; });
  }, []);
  const setGold = useCallback((c: string) => {
    setPerso(p => { const np = { ...p, gold: c }; persist(modeRef.current, np); return np; });
  }, []);
  const reinitialiser = useCallback(() => {
    setPerso(() => { persist(modeRef.current, {}); return {}; });
  }, []);

  const value: ThemeContextValue = useMemo(() => ({
    mode,
    setMode,
    accent: tokens.terracotta,
    gold: tokens.gold,
    setAccent,
    setGold,
    reinitialiser,
    personnalise: perso.terracotta !== undefined || perso.gold !== undefined,
    canvas: canvasPalette(tokens, mode),
  }), [mode, setMode, tokens, setAccent, setGold, reinitialiser, perso]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Repli sûr hors provider (ne devrait pas arriver) : palette sombre.
    const t = PRESETS.sombre;
    return {
      mode: 'sombre',
      setMode: () => {},
      accent: t.terracotta,
      gold: t.gold,
      setAccent: () => {},
      setGold: () => {},
      reinitialiser: () => {},
      personnalise: false,
      canvas: canvasPalette(t, 'sombre'),
    };
  }
  return ctx;
}
