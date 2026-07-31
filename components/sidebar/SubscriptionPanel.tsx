'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useProject } from '@/lib/supabase/ProjectContext';
import { useT } from '@/lib/i18n/LangProvider';
import { ouvrirPaiement, ouvrirPortail, lireRetourPaiement, nettoyerRetourPaiement } from '@/lib/stripe/checkout';
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
  // Lecture PURE de l'URL, faite une fois à l'initialisation : le nettoyage de
  // la barre d'adresse, lui, est un effet de bord et vit dans un effet.
  const [retour] = useState<'ok' | 'annule' | null>(() => lireRetourPaiement());
  const [attente, setAttente] = useState(retour === 'ok');
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  /** Interroge la base. Ne touche pas à l'état : l'appelant s'en charge. */
  const charger = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase
      .from('mon_abonnement')
      .select('abo_statut, abo_fin, abo_annule_a_la_fin')
      .maybeSingle();
    return data ?? null;
  }, []);

  const appliquer = useCallback((data: Awaited<ReturnType<typeof charger>>) => {
    const e: EtatAbonnement = {
      statut: (data?.abo_statut as EtatAbonnement['statut']) ?? null,
      finPeriode: (data?.abo_fin as string | null) ?? null,
    };
    setEtat(e);
    setAnnuleALaFin(data?.abo_annule_a_la_fin === true);
    return abonnementActif(e);
  }, []);

  useEffect(() => { nettoyerRetourPaiement(); }, []);

  useEffect(() => {
    let annule = false;
    // Toutes les mises à jour d'état passent par un rappel de promesse : jamais
    // pendant le corps de l'effet, pour éviter les rendus en cascade.
    charger().then(d => { if (!annule) appliquer(d); }).catch(() => {});
    return () => { annule = true; };
  }, [charger, appliquer]);

  // Retour de Stripe : l'abonnement est inscrit par le webhook, avec quelques
  // secondes de décalage. On relance la lecture plutôt que d'afficher
  // « offre gratuite » à quelqu'un qui vient de payer.
  useEffect(() => {
    if (retour !== 'ok') return;
    let annule = false;
    (async () => {
      for (const delai of RELANCES) {
        if (annule) return;
        if (appliquer(await charger())) break;
        await new Promise(res => setTimeout(res, delai));
      }
      if (!annule) setAttente(false);
    })();
    return () => { annule = true; };
  }, [retour, charger, appliquer]);

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
