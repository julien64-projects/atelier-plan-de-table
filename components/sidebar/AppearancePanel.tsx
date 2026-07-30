'use client';

import { useTheme } from '@/lib/theme/ThemeProvider';
import { useLang } from '@/lib/i18n/LangProvider';
import { LANGS } from '@/lib/i18n/dictionary';

/** Réglages d'apparence : langue + thème clair/sombre + personnalisation. */
export default function AppearancePanel() {
  const { mode, setMode, accent, gold, setAccent, setGold, reinitialiser, personnalise } = useTheme();
  const { lang, setLang, t } = useLang();

  return (
    <div className="space-y-4">
      {/* Langue */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-faint mb-1">{t('appearance.langue')}</p>
        <div className="flex gap-1">
          {LANGS.map(l => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
                lang === l.key
                  ? 'bg-terracotta text-white border-terracotta'
                  : 'bg-cream text-muted border-line hover:bg-line'
              }`}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ambiance */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-faint mb-1">{t('appearance.ambiance')}</p>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('clair')}
            className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
              mode === 'clair'
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-cream text-muted border-line hover:bg-line'
            }`}
          >
            {t('appearance.clair')}
          </button>
          <button
            onClick={() => setMode('sombre')}
            className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
              mode === 'sombre'
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-cream text-muted border-line hover:bg-line'
            }`}
          >
            {t('appearance.sombre')}
          </button>
        </div>
      </div>

      {/* Couleurs personnalisées */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-faint">{t('appearance.couleurs')}</p>
        <label className="flex items-center justify-between text-xs text-muted">
          <span>{t('appearance.accent')}</span>
          <input
            type="color"
            value={accent}
            onChange={e => setAccent(e.target.value)}
            className="w-9 h-6 rounded border border-line bg-transparent cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between text-xs text-muted">
          <span>{t('appearance.or')}</span>
          <input
            type="color"
            value={gold}
            onChange={e => setGold(e.target.value)}
            className="w-9 h-6 rounded border border-line bg-transparent cursor-pointer"
          />
        </label>
        {personnalise && (
          <button onClick={reinitialiser} className="text-xs text-muted hover:text-ink underline">
            {t('appearance.reset')}
          </button>
        )}
      </div>
    </div>
  );
}
