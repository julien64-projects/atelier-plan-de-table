'use client';

import { useLang } from '@/lib/i18n/LangProvider';
import { LANGS } from '@/lib/i18n/dictionary';

/**
 * Bascule de langue FR / ENG, partagée par le site vitrine et l'application.
 *
 * Les codes sont écrits en clair plutôt qu'affichés en drapeaux : Windows ne
 * dispose pas des glyphes de drapeaux et retombe sur le code pays, ce qui
 * donnait un libellé différent selon le système.
 *
 * Le rembourrage vise 40 px de haut : sous ce seuil, la cible se rate au doigt.
 */
export default function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {LANGS.map(l => (
        <button
          key={l.key}
          onClick={() => setLang(l.key)}
          aria-label={l.label}
          aria-pressed={lang === l.key}
          className={`px-2.5 py-2 text-xs font-medium tracking-wider leading-none rounded transition-colors ${
            lang === l.key ? 'text-ink' : 'text-faint hover:text-muted'
          }`}
        >
          {l.court}
        </button>
      ))}
    </div>
  );
}
