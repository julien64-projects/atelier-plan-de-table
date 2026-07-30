'use client';

/**
 * Contexte de langue (FR / EN). Fournit `lang`, `setLang` et le traducteur
 * `t(clé)`. Persisté en localStorage. Repli sur le français pour toute clé non
 * encore traduite (déploiement progressif de l'i18n).
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { translate, type Lang } from './dictionary';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const KEY = 'apt:lang';

const LangContext = createContext<LangContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => translate('fr', key),
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored === 'en' || stored === 'fr') setLangState(stored);
    } catch { /* ignore */ }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
    if (typeof document !== 'undefined') document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

/** Raccourci pour ne récupérer que le traducteur. */
export function useT() {
  return useContext(LangContext).t;
}
