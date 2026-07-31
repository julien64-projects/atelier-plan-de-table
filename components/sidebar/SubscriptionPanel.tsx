'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useProject } from '@/lib/supabase/ProjectContext';
import { useT } from '@/lib/i18n/LangProvider';
import { ouvrirPaiement, ouvrirPortail, lireRetourPaiement } from '@/lib/stripe/checkout';
import { abonnementActif, libelleAbonnement, type EtatAbonnement } from '@/lib/stripe/abonnement';

/** Délais d'attente du webhook après retour de Stripe (ms). */
const RELANCES = [1500, 3000, 5000, 8000];

/**
 * État de l'abonnement et accès au paiement.
 *
 * Au retour de Stripe, l'abonnement n'est pas encore enregistré : c'est le
 * webhook qui l'inscrit, et il arrive une poignée de secondes plus tard. On
 * relance donc la lecture quelques fois plutôt que d'afficher « offre
 * gratuite » à quelqu'un qui vient de payer.
 */
export default function SubscriptionPanel() {
  const { isOwner } = useProject();
  const t = useT();

  const [etat, setEtat] = useState<EtatAbonnement>({ statut: null, finPeriode: null });
  const [annuleALaFin, setAnnuleALaFin] = useState(false);
  const [retour, setRetour] = useState<'ok' | 'annule' | null>(null);
  const [attente, setAttente] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const lire = useCallback(async (): Promise<boolean> => {
    if (!supabase) return false;
    const { data } = await supabase
      .from('mon_abonnement')
      .select('abo_statut, abo_fin, abo_annule_a_la_fin')
      .maybeSingle();
    const e: EtatAbonnement = {
      statut: (data?.abo_statut as EtatAbonnement['statut']) ?? null,
      finPeriode: (data?.abo_fin as string | null) ?? null,
    };
    setEtat(e);
    setAnnuleALaFin(data?.abo_annule_a_la_fin === true);
    return abonnementActif(e);
  }, []);

  useEffect(() => { lire(); }, [lire]);

  // Retour de Stripe : on attend que le webhook ait fait son travail.
  useEffect(() => {
    const r = lireRetourPaiement();
    if (!r) return;
    setRetour(r);
    if (r !== 'ok') return;

    let annule = false;
    setAttente(true);
    (async () => {
      for (const delai of RELANCES) {
        if (annule) return;
        if (await lire()) break;
        await new Promise(res => setTimeout(res, delai));
      }
      if (!annule) setAttente(false);
    })();
    return () => { annule = true; };
  }, [lire]);

  if (!supabase || !isOwner) return null;

  const actif = abonnementActif(etat);
  const libelle = libelleAbonnement(etat, annuleALaFin);

  const lancer = async (action: 'payer' | 'portail') => {
    setBusy(true);
    setErreur(null);
    try {
      await (action === 'payer' ? ouvrirPaiement(supabase!) : ouvrirPortail(supabase!));
    } catch (e) {
      setErreur((e as Error).message);
      setBusy(false);
    }
  };

  const finLisible = etat.finPeriode ? new Date(etat.finPeriode).toLocaleDateString() : null;

  return (
    <div className="space-y-3">
      {retour === 'ok' && (
        <p className="text-xs text-sage leading-snug">
          {attente ? t('abo.retourAttente') : t('abo.retourOk')}
        </p>
      )}
      {retour === 'annule' && (
        <p className="text-xs text-muted leading-snug">{t('abo.retourAnnule')}</p>
      )}

      <div className="px-3 py-2.5 bg-cream rounded-lg">
        <p className="text-[10px] uppercase tracking-wide text-faint">{t('abo.etat')}</p>
        <p className="text-sm text-ink mt-0.5">{t(`abo.statut.${libelle}`)}</p>
        {finLisible && libelle !== 'gratuit' && (
          <p className="text-[11px] text-muted mt-1">
            {(annuleALaFin ? t('abo.finLe') : t('abo.renouvelleLe')).replace('{date}', finLisible)}
          </p>
        )}
      </div>

      {!actif && (
        <>
          <p className="text-xs text-muted leading-snug">{t('abo.argumentaire')}</p>
          <button
            onClick={() => lancer('payer')}
            disabled={busy}
            className="w-full px-3 py-2 text-sm bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors disabled:opacity-60"
          >
            {busy ? '…' : t('abo.souscrire')}
          </button>
          <p className="text-[10px] text-faint text-center">{t('abo.mentionPro')}</p>
        </>
      )}

      {actif && (
        <button
          onClick={() => lancer('portail')}
          disabled={busy}
          className="w-full px-3 py-2 text-sm bg-cream border border-line text-ink rounded hover:bg-line transition-colors disabled:opacity-60"
        >
          {busy ? '…' : t('abo.gerer')}
        </button>
      )}

      {erreur && <p className="text-xs text-terracotta leading-snug">{erreur}</p>}
    </div>
  );
}
