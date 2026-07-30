'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useT } from '@/lib/i18n/LangProvider';
import { tokenValide } from '@/lib/shareLink';
import { infosLien, rejoindreAvecLien, type InfosLien } from '@/lib/supabase/joinLink';

type Etat = 'verification' | 'pret' | 'invalide' | 'jonction' | 'erreur' | 'indisponible';

/**
 * Page d'entrée d'un lien de partage. Les mariés n'ont ni compte ni mot de
 * passe : on ouvre une session anonyme Supabase puis on consomme le lien
 * (RPC redeem_project_link), avant de basculer sur l'éditeur.
 *
 * Le prénom est facultatif ; il sert à identifier qui modifie le plan.
 */
export default function JoinByLink({ token }: { token: string }) {
  const t = useT();
  const router = useRouter();
  // Le lien est jugé sur pièces dès le premier rendu : pas de Supabase ou
  // token mal formé se voient sans aller-retour réseau.
  const [etat, setEtat] = useState<Etat>(() =>
    !supabase ? 'indisponible' : !tokenValide(token) ? 'invalide' : 'verification',
  );
  const [infos, setInfos] = useState<InfosLien | null>(null);
  const [prenom, setPrenom] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);

  // 1. Vérifier le lien avant de proposer quoi que ce soit
  useEffect(() => {
    if (!supabase || !tokenValide(token)) return;
    let annule = false;
    infosLien(supabase, token)
      .then(i => {
        if (annule) return;
        if (!i) { setEtat('invalide'); return; }
        setInfos(i);
        setEtat('pret');
      })
      .catch(() => { if (!annule) setEtat('invalide'); });
    return () => { annule = true; };
  }, [token]);

  // 2. Session anonyme + consommation du lien
  const rejoindre = useCallback(async () => {
    if (!supabase) return;
    setEtat('jonction');
    setErreur(null);
    try {
      await rejoindreAvecLien(supabase, token, prenom);
      router.replace('/app');
    } catch (e) {
      const msg = (e as Error).message ?? '';
      setErreur(
        /anonymous/i.test(msg) ? t('join.anonDisabled')
        : /expir|invalide/i.test(msg) ? t('join.expired')
        : `${t('share.fail')}${msg}`,
      );
      setEtat('erreur');
    }
  }, [token, prenom, router, t]);

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
          {etat === 'verification' && (
            <p className="text-sm text-muted text-center">{t('join.checking')}</p>
          )}

          {etat === 'indisponible' && (
            <p className="text-sm text-terracotta">{t('join.noSupabase')}</p>
          )}

          {etat === 'invalide' && (
            <>
              <p className="text-sm text-terracotta">{t('join.invalid')}</p>
              <p className="text-xs text-muted leading-snug">{t('join.invalidHint')}</p>
            </>
          )}

          {(etat === 'pret' || etat === 'jonction' || etat === 'erreur') && infos && (
            <>
              <p className="text-sm text-muted leading-snug">
                {t('join.intro')}{' '}
                <span className="text-ink">{infos.couple_names || t('join.theProject')}</span>
              </p>
              <p className="text-xs text-faint">
                {infos.role === 'edition' ? t('join.roleEdit') : t('join.roleRead')}
              </p>

              <div>
                <label className="text-sm text-muted">{t('join.firstName')}</label>
                <input
                  value={prenom}
                  onChange={e => setPrenom(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && etat !== 'jonction' && rejoindre()}
                  maxLength={40}
                  placeholder={t('join.firstNamePlaceholder')}
                  className="mt-1 w-full px-3 py-2 text-sm bg-cream border border-line rounded-lg text-ink focus:outline-none focus:border-gold/60"
                />
              </div>

              {erreur && <p className="text-sm text-terracotta">{erreur}</p>}

              <button
                onClick={rejoindre}
                disabled={etat === 'jonction'}
                className="w-full px-4 py-2.5 rounded-lg bg-gold/90 text-[#1a1114] font-medium hover:bg-gold transition-colors disabled:opacity-60"
              >
                {etat === 'jonction' ? '…' : t('join.open')}
              </button>

              <p className="text-[11px] text-faint text-center leading-snug">{t('join.noAccount')}</p>
            </>
          )}

          {etat === 'erreur' && !infos && (
            <p className="text-sm text-terracotta">{erreur}</p>
          )}
        </div>
      </div>
    </div>
  );
}
