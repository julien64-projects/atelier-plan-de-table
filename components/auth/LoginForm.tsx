'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { useT } from '@/lib/i18n/LangProvider';

export default function LoginForm() {
  const { signIn, signUp, demanderReinitialisation } = useAuth();
  const t = useT();
  const [mode, setMode] = useState<'connexion' | 'inscription' | 'oubli'>('connexion');
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
    if (mode === 'oubli') {
      const res = await demanderReinitialisation(email);
      setBusy(false);
      // On confirme l'envoi SANS révéler si l'adresse existe : sinon le
      // formulaire devient un moyen de tester quelles adresses sont inscrites.
      if (res.error) setError(res.error);
      else { setInfo(t('auth.reset.envoye')); setMode('connexion'); }
      return;
    }

    const action = mode === 'connexion' ? signIn : signUp;
    const res = await action(email.trim(), password);
    setBusy(false);
    if (res.error) {
      setError(res.error);
    } else if (res.needsConfirmation) {
      setInfo(t('auth.needConfirm'));
      setMode('connexion');
    }
    // En cas de succès avec session, AuthGate bascule automatiquement sur l'app.
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--background)] px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-blush font-semibold">{t('brand.eyebrow')}</p>
          <h1 className="text-[32px] leading-tight text-ink mt-1">TablePlan</h1>
          <div className="flex items-center justify-center gap-3 text-gold my-3">
            <span className="h-px w-8 bg-gold/50" />
            <span className="text-xs">&#10086;</span>
            <span className="h-px w-8 bg-gold/50" />
          </div>
          <p className="text-xs text-muted italic">{t('brand.tagline.login')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm text-muted">{t('auth.email')}</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm bg-cream border border-line rounded-lg text-ink focus:outline-none focus:border-gold/60"
            />
          </div>
          {mode !== 'oubli' && (
          <div>
            <label className="text-sm text-muted">{t('auth.password')}</label>
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
          )}

          {error && <p className="text-sm text-terracotta">{error}</p>}
          {info && <p className="text-sm text-gold">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 rounded-lg bg-gold/90 text-[#1a1114] font-medium hover:bg-gold transition-colors disabled:opacity-60"
          >
            {busy ? '…' : mode === 'oubli' ? t('auth.reset.envoyer') : mode === 'connexion' ? t('auth.signin') : t('auth.signup')}
          </button>

          <button
            type="button"
            onClick={() => { setMode(m => (m === 'inscription' ? 'connexion' : 'inscription')); setError(null); setInfo(null); }}
            className="w-full text-xs text-muted hover:text-ink transition-colors py-1"
          >
            {mode === 'inscription' ? t('auth.toSignin') : t('auth.toSignup')}
          </button>

          <button
            type="button"
            onClick={() => { setMode(m => (m === 'oubli' ? 'connexion' : 'oubli')); setError(null); setInfo(null); }}
            className="w-full text-xs text-faint hover:text-muted transition-colors py-1"
          >
            {mode === 'oubli' ? t('auth.reset.retour') : t('auth.reset.oubli')}
          </button>
        </form>
      </div>
    </div>
  );
}
