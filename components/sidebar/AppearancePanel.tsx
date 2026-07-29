'use client';

import { useTheme } from '@/lib/theme/ThemeProvider';

/** Réglages d'apparence : thème clair/sombre + personnalisation des couleurs. */
export default function AppearancePanel() {
  const { mode, setMode, accent, gold, setAccent, setGold, reinitialiser, personnalise } = useTheme();

  return (
    <div className="space-y-4">
      {/* Ambiance */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-faint mb-1">Ambiance</p>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('clair')}
            className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
              mode === 'clair'
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-cream text-muted border-line hover:bg-line'
            }`}
          >
            ☀ Clair
          </button>
          <button
            onClick={() => setMode('sombre')}
            className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
              mode === 'sombre'
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-cream text-muted border-line hover:bg-line'
            }`}
          >
            ☾ Sombre
          </button>
        </div>
      </div>

      {/* Couleurs personnalisées */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-faint">Couleurs</p>
        <label className="flex items-center justify-between text-xs text-muted">
          <span>Accent (boutons)</span>
          <input
            type="color"
            value={accent}
            onChange={e => setAccent(e.target.value)}
            className="w-9 h-6 rounded border border-line bg-transparent cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between text-xs text-muted">
          <span>Filets d&apos;or</span>
          <input
            type="color"
            value={gold}
            onChange={e => setGold(e.target.value)}
            className="w-9 h-6 rounded border border-line bg-transparent cursor-pointer"
          />
        </label>
        {personnalise && (
          <button onClick={reinitialiser} className="text-xs text-muted hover:text-ink underline">
            Réinitialiser les couleurs
          </button>
        )}
      </div>
    </div>
  );
}
