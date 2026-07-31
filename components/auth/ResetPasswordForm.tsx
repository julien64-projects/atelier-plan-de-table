'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { useT } from '@/lib/i18n/LangProvider';

const LONGUEUR_MIN = 8;

/**
 * Écran de définition d'un nouveau mot de passe, atteint depuis le lien de
 * réinitialisation reçu par email.
 *
 * Le lien porte un jeton de récupération que supabase-js consomme au
 * chargement pour ouvrir une session temporaire. Tant que cette session n'est
 * pas établie, on n'affiche pas le formulaire : sans elle, l'enregistrement
 * échouerait avec un message incompréhensible.
 */
export default function ResetPasswordForm() {
  const { changerMotDePasse } = useAuth();
  const t = useT();
  const router = useRouter();

  // Sans Supabase configuré, l'état est connu dès le premier rendu : on le
  // pose à l'initialisation plutôt que dans un effet.
  const [pret, setPret] = useState<boolean | null>(supabase ? null : false);
  const [motDePasse, setMotDePasse] = useState('');
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [fait, setFait] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let annule = false;
    // Laisser à supabase-js le temps de traiter le jeton présent dans l'URL.
    supabase.auth.getSession()
      .then(({ data }) => { if (!annule) setPret(!!data.session); })
      .catch(() => { if (!annule) setPret(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!annule && s) setPret(true);
    });
    return () => { annule = true; sub.subscription.unsubscribe(); };
  }, []);

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (motDePasse.length < LONGUEUR_MIN) { setErreur(t('auth.reset.tropCourt')); return; }
    setBusy(true);
    setErreur(null);
    const res = await changerMotDePasse(motDePasse);
    setBusy(false);
    if (res.error) { setErreur(res.error); return; }
    setFait(true);
    setTimeout(() => router.replace('/app'), 1800);
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
        </div>

        <div className="bg-surface border border-line rounded-2xl p-6 space-y-4">
          {pret === null && <p className="text-sm text-muted text-center">{t('auth.reset.verif')}</p>}

          {pret === false && (
            <>
              <p className="text-sm text-terracotta">{t('auth.reset.lienInvalide')}</p>
              <a href="/app" className="block text-center text-xs text-muted hover:text-ink transition-colors py-2">
                {t('auth.reset.retour')}
              </a>
            </>
          )}

          {pret && fait && <p className="text-sm text-sage">{t('auth.reset.ok')}</p>}

          {pret && !fait && (
            <form onSubmit={enregistrer} className="space-y-4">
              <p className="text-sm text-muted leading-snug">{t('auth.reset.consigne')}</p>
              <div>
                <label className="text-sm text-muted">{t('auth.reset.nouveau')}</label>
                <input
                  type="password"
                  autoFocus
                  required
                  minLength={LONGUEUR_MIN}
                  autoComplete="new-password"
                  value={motDePasse}
                  onChange={e => setMotDePasse(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm bg-cream border border-line rounded-lg text-ink focus:outline-none focus:border-gold/60"
                />
              </div>
              {erreur && <p className="text-sm text-terracotta">{erreur}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full px-4 py-2.5 rounded-lg bg-gold/90 text-[#1a1114] font-medium hover:bg-gold transition-colors disabled:opacity-60"
              >
                {busy ? '…' : t('auth.reset.enregistrer')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
