'use client';

import { useTheme } from '@/lib/theme/ThemeProvider';
import { useLang } from '@/lib/i18n/LangProvider';

/** Réglages d'apparence : thème clair/sombre + personnalisation.
 *  La langue vit dans l'en-tête de la barre latérale : ce n'est pas un
 *  réglage d'apparence, et elle doit rester visible sans déplier de section. */
export default function AppearancePanel() {
  const { mode, setMode, accent, gold, setAccent, setGold, reinitialiser, personnalise } = useTheme();
  const { t } = useLang();

  return (
    <div className="space-y-4">
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
