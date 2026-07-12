'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/supabase/AuthProvider';

export default function LoginForm() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    const action = mode === 'connexion' ? signIn : signUp;
    const res = await action(email.trim(), password);
    setBusy(false);
    if (res.error) {
      setError(res.error);
    } else if (res.needsConfirmation) {
      setInfo('Compte créé. Vérifie tes emails pour confirmer ton adresse, puis connecte-toi.');
      setMode('connexion');
    }
    // En cas de succès avec session, AuthGate bascule automatiquement sur l'app.
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--background)] px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-blush font-semibold">L&apos;Atelier</p>
          <h1 className="text-[32px] leading-tight text-ink mt-1">Plan de Table</h1>
          <div className="flex items-center justify-center gap-3 text-gold my-3">
            <span className="h-px w-8 bg-gold/50" />
            <span className="text-xs">&#10086;</span>
            <span className="h-px w-8 bg-gold/50" />
          </div>
          <p className="text-xs text-muted italic">Espace wedding planner</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm text-muted">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm bg-cream border border-line rounded-lg text-ink focus:outline-none focus:border-gold/60"
            />
          </div>
          <div>
            <label className="text-sm text-muted">Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm bg-cream border border-line rounded-lg text-ink focus:outline-none focus:border-gold/60"
            />
          </div>

          {error && <p className="text-sm text-terracotta">{error}</p>}
          {info && <p className="text-sm text-gold">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 rounded-lg bg-gold/90 text-[#1a1114] font-medium hover:bg-gold transition-colors disabled:opacity-60"
          >
            {busy ? '…' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(m => (m === 'connexion' ? 'inscription' : 'connexion')); setError(null); setInfo(null); }}
            className="w-full text-xs text-muted hover:text-ink transition-colors"
          >
            {mode === 'connexion'
              ? 'Pas encore de compte ? Créer un compte'
              : 'Déjà un compte ? Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
