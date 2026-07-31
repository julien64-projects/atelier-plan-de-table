'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { useT } from '@/lib/i18n/LangProvider';

const LONGUEUR_MIN = 8;

type Volet = null | 'email' | 'motDePasse' | 'suppression';

/**
 * Gestion du compte : adresse, mot de passe, suppression.
 *
 * Chaque action est repliée derrière un bouton : ce sont des opérations rares
 * et irréversibles pour la dernière, elles n'ont pas à occuper l'écran en
 * permanence ni à être déclenchées par mégarde.
 */
export default function AccountPanel() {
  const { user, changerEmail, changerMotDePasse, signOut } = useAuth();
  const t = useT();

  const [volet, setVolet] = useState<Volet>(null);
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  /**
   * L'adresse d'authentification fait foi. Après confirmation d'un changement,
   * la ligne `planner` porte encore l'ancienne : on la réaligne, sans quoi les
   * partages par email et la facturation viseraient une adresse périmée.
   */
  const synchroniser = useCallback(async () => {
    if (!supabase || !user?.email) return;
    const { data } = await supabase.from('planner').select('email').eq('id', user.id).maybeSingle();
    if (data && data.email !== user.email) {
      await supabase.from('planner').update({ email: user.email }).eq('id', user.id);
    }
  }, [user]);

  useEffect(() => { synchroniser().catch(() => {}); }, [synchroniser]);

  if (!supabase || !user) return null;

  const ouvrir = (v: Volet) => {
    setVolet(volet === v ? null : v);
    setMsg(null); setErreur(null);
    setEmail(''); setMotDePasse(''); setConfirmation('');
  };

  const validerEmail = async () => {
    const e = email.trim();
    if (!e.includes('@')) { setErreur(t('share.emailInvalid')); return; }
    setBusy(true); setErreur(null);
    const res = await changerEmail(e);
    setBusy(false);
    if (res.error) setErreur(res.error);
    else { setMsg(t('compte.email.envoye').replace('{email}', e)); setVolet(null); }
  };

  const validerMotDePasse = async () => {
    if (motDePasse.length < LONGUEUR_MIN) { setErreur(t('auth.reset.tropCourt')); return; }
    if (motDePasse !== confirmation) { setErreur(t('compte.mdp.discordance')); return; }
    setBusy(true); setErreur(null);
    const res = await changerMotDePasse(motDePasse);
    setBusy(false);
    if (res.error) setErreur(res.error);
    else { setMsg(t('compte.mdp.ok')); setVolet(null); }
  };

  const supprimer = async () => {
    // Double garde : saisir son adresse, puis confirmer. La suppression
    // emporte tous les mariages, invités compris.
    if (confirmation.trim().toLowerCase() !== (user.email ?? '').toLowerCase()) {
      setErreur(t('compte.suppr.emailAttendu')); return;
    }
    if (!window.confirm(t('compte.suppr.confirmer'))) return;

    setBusy(true); setErreur(null);
    try {
      const { data } = await supabase!.auth.getSession();
      const r = await fetch('/api/compte/supprimer', {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}` },
      });
      const corps = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(corps?.error ?? `Échec (${r.status})`);
      await signOut();
      window.location.href = '/';
    } catch (e) {
      setErreur((e as Error).message);
      setBusy(false);
    }
  };

  const champ = 'w-full px-2 py-1.5 text-xs bg-cream border border-line rounded text-ink';
  const lien = 'w-full text-left px-2 py-2 text-xs text-muted hover:text-ink transition-colors rounded hover:bg-cream';

  return (
    <div className="space-y-2">
      <div className="px-2 py-1.5 bg-cream rounded">
        <p className="text-[10px] uppercase tracking-wide text-faint">{t('compte.adresse')}</p>
        <p className="text-xs text-ink truncate" title={user.email ?? ''}>{user.email}</p>
      </div>

      {msg && <p className="text-[11px] text-sage leading-snug">{msg}</p>}

      <button onClick={() => ouvrir('email')} className={lien}>{t('compte.changerEmail')}</button>
      {volet === 'email' && (
        <div className="space-y-1.5 px-2 pb-1">
          <input
            type="email" autoFocus value={email} placeholder={t('compte.nouvelEmail')}
            onChange={e => setEmail(e.target.value)} className={champ}
          />
          <p className="text-[10px] text-faint leading-snug">{t('compte.email.note')}</p>
          <button onClick={validerEmail} disabled={busy}
            className="w-full px-2 py-1.5 text-xs bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors disabled:opacity-60">
            {busy ? '…' : t('compte.valider')}
          </button>
        </div>
      )}

      <button onClick={() => ouvrir('motDePasse')} className={lien}>{t('compte.changerMdp')}</button>
      {volet === 'motDePasse' && (
        <div className="space-y-1.5 px-2 pb-1">
          <input
            type="password" autoFocus autoComplete="new-password" value={motDePasse}
            placeholder={t('compte.mdp.nouveau')} onChange={e => setMotDePasse(e.target.value)} className={champ}
          />
          <input
            type="password" autoComplete="new-password" value={confirmation}
            placeholder={t('compte.mdp.repeter')} onChange={e => setConfirmation(e.target.value)} className={champ}
          />
          <button onClick={validerMotDePasse} disabled={busy}
            className="w-full px-2 py-1.5 text-xs bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors disabled:opacity-60">
            {busy ? '…' : t('compte.valider')}
          </button>
        </div>
      )}

      <button onClick={() => ouvrir('suppression')} className={`${lien} text-faint hover:text-red-400`}>
        {t('compte.supprimer')}
      </button>
      {volet === 'suppression' && (
        <div className="space-y-1.5 px-2 pb-1">
          <p className="text-[10px] text-terracotta leading-snug">{t('compte.suppr.avertissement')}</p>
          <input
            autoFocus value={confirmation} placeholder={user.email ?? ''}
            onChange={e => setConfirmation(e.target.value)} className={champ}
          />
          <button onClick={supprimer} disabled={busy}
            className="w-full px-2 py-1.5 text-xs border border-red-400/60 text-red-400 rounded hover:bg-red-400/10 transition-colors disabled:opacity-60">
            {busy ? '…' : t('compte.suppr.bouton')}
          </button>
        </div>
      )}

      {erreur && <p className="text-[11px] text-terracotta leading-snug px-2">{erreur}</p>}
    </div>
  );
}
