'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { useProject } from '@/lib/supabase/ProjectContext';
import { useT } from '@/lib/i18n/LangProvider';
import {
  listerProjets, creerProjet, renommerProjet, supprimerProjet,
  definirProjetActif, nomProjet, ERREUR_QUOTA, type ProjetResume,
} from '@/lib/supabase/projects';
import { abonnementActif, peutCreerProjet, auDessusDuQuota, type EtatAbonnement } from '@/lib/stripe/abonnement';

/**
 * Sélecteur de projet : un projet = un mariage.
 *
 * Changer de projet recharge la page. Le magasin (salle, tables, invités) est
 * peuplé une fois au démarrage par ProjectSync ; le réinitialiser à chaud
 * demanderait d'invalider proprement l'abonnement Realtime, le minuteur
 * d'écriture et trois réducteurs. Un rechargement est ici plus sûr que malin,
 * et l'opération reste rare.
 */
export default function ProjectSwitcher() {
  const { user } = useAuth();
  const { projectId, isOwner } = useProject();
  const t = useT();

  const [projets, setProjets] = useState<ProjetResume[]>([]);
  const [abonne, setAbonne] = useState(false);
  const [ouvert, setOuvert] = useState(false);
  const [renomme, setRenomme] = useState<string | null>(null);
  const [nom, setNom] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const rafraichir = useCallback(() => {
    if (!supabase || !user) return;
    listerProjets(supabase, user.id).then(setProjets).catch(() => {});
    supabase
      .from('mon_abonnement')
      .select('abo_statut, abo_fin')
      .maybeSingle()
      .then(({ data }) => {
        const etat: EtatAbonnement = {
          statut: (data?.abo_statut as EtatAbonnement['statut']) ?? null,
          finPeriode: (data?.abo_fin as string | null) ?? null,
        };
        setAbonne(abonnementActif(etat));
      });
  }, [user]);

  useEffect(() => { rafraichir(); }, [rafraichir]);

  // Les invités par lien ne gèrent pas de projets : ils en consultent un seul.
  if (!supabase || !user || !isOwner) return null;

  const courant = projets.find(p => p.id === projectId);
  const peutCreer = peutCreerProjet(projets.length, abonne);
  const auDessus = auDessusDuQuota(projets.length, abonne);

  const basculer = (id: string) => {
    if (id === projectId) { setOuvert(false); return; }
    definirProjetActif(id);
    window.location.reload();
  };

  const creer = async () => {
    setBusy(true); setMsg(null);
    try {
      const p = await creerProjet(supabase!, '');
      definirProjetActif(p.id);
      window.location.reload();
    } catch (e) {
      setMsg((e as Error).message === ERREUR_QUOTA ? t('projets.quota') : t('share.fail') + (e as Error).message);
      setBusy(false);
    }
  };

  const valider = async (id: string) => {
    const n = nom.trim();
    setRenomme(null);
    if (!n) return;
    await renommerProjet(supabase!, id, n).catch(() => {});
    rafraichir();
  };

  const supprimer = async (p: ProjetResume) => {
    // Suppression définitive : on nomme explicitement ce qui disparaît.
    const ok = window.confirm(t('projets.confirmSuppr').replace('{nom}', nomProjet(p, t('projets.sansNom'))));
    if (!ok) return;
    await supprimerProjet(supabase!, p.id).catch(() => {});
    if (p.id === projectId) {
      definirProjetActif(null);
      window.location.reload();
      return;
    }
    rafraichir();
  };

  return (
    <div className="px-4 pt-3 pb-2 border-b border-line">
      <button
        onClick={() => setOuvert(o => !o)}
        className="w-full flex items-center justify-between gap-2 text-left group"
      >
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-faint">
            {t('projets.titre')}
          </span>
          <span className="block text-sm text-ink truncate">
            {courant ? nomProjet(courant, t('projets.sansNom')) : '…'}
          </span>
        </span>
        <span className={`text-faint transition-transform shrink-0 ${ouvert ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {ouvert && (
        <div className="mt-2 space-y-1">
          {projets.map(p => (
            <div key={p.id} className="flex items-center gap-1">
              {renomme === p.id ? (
                <input
                  autoFocus
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  onBlur={() => valider(p.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') valider(p.id);
                    if (e.key === 'Escape') setRenomme(null);
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-cream border border-gold/50 rounded text-ink"
                />
              ) : (
                <button
                  onClick={() => basculer(p.id)}
                  className={`flex-1 min-w-0 text-left px-2 py-1.5 text-xs rounded transition-colors truncate ${
                    p.id === projectId ? 'bg-terracotta text-white' : 'bg-cream text-muted hover:text-ink'
                  }`}
                >
                  {nomProjet(p, t('projets.sansNom'))}
                </button>
              )}
              <button
                onClick={() => { setRenomme(p.id); setNom((p.couple_names ?? '').trim()); }}
                className="px-1.5 py-1 text-xs text-faint hover:text-ink transition-colors"
                aria-label={t('projets.renommer')}
                title={t('projets.renommer')}
              >
                ✎
              </button>
              <button
                onClick={() => supprimer(p)}
                disabled={projets.length <= 1}
                className="px-1.5 py-1 text-xs text-faint hover:text-red-400 transition-colors disabled:opacity-30"
                aria-label={t('projets.supprimer')}
                title={projets.length <= 1 ? t('projets.dernier') : t('projets.supprimer')}
              >
                ×
              </button>
            </div>
          ))}

          <button
            onClick={creer}
            disabled={busy || !peutCreer}
            className="w-full px-2 py-1.5 text-xs rounded border border-line text-muted hover:text-ink hover:border-gold/60 transition-colors disabled:opacity-50"
            title={peutCreer ? undefined : t('projets.quota')}
          >
            {busy ? '…' : `+ ${t('projets.nouveau')}`}
          </button>

          {!peutCreer && <p className="text-[10px] text-faint leading-snug">{t('projets.quota')}</p>}
          {auDessus && <p className="text-[10px] text-gold leading-snug">{t('projets.auDessus')}</p>}
          {msg && <p className="text-[10px] text-terracotta leading-snug">{msg}</p>}
        </div>
      )}
    </div>
  );
}
