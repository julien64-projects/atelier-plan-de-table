'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useProject } from '@/lib/supabase/ProjectContext';
import { useT } from '@/lib/i18n/LangProvider';
import {
  listShares, addShare, removeShare, type ShareRow,
  listLinks, createLink, revokeLink, type LinkRow,
} from '@/lib/supabase/projectData';
import {
  lienRejoindre, dateExpiration, lienActif, type Expiration,
} from '@/lib/shareLink';

/**
 * Partage d'un projet, deux voies :
 *
 * 1. Lien privé (recommandé) — une URL secrète que les mariés ouvrent sans
 *    compte ni mot de passe. Le token n'existe qu'ici et dans l'URL : la base
 *    n'en garde que le haché, donc un lien ne peut être RÉaffiché que sur le
 *    navigateur qui l'a créé (mémoire locale ci-dessous). Sinon, on en crée
 *    un nouveau et on révoque l'ancien.
 * 2. Invitation par email — la personne se connecte avec ce même email
 *    (utile pour un collègue planner qui a déjà un compte).
 */

const CLE_TOKENS = 'apt:liens';

/** Tokens en clair mémorisés localement, pour pouvoir recopier un lien. */
function lireTokens(projectId: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(`${CLE_TOKENS}:${projectId}`) ?? '{}');
  } catch { return {}; }
}

function ecrireTokens(projectId: string, tokens: Record<string, string>) {
  try {
    localStorage.setItem(`${CLE_TOKENS}:${projectId}`, JSON.stringify(tokens));
  } catch { /* ignore */ }
}

export default function SharePanel() {
  const { projectId, isOwner } = useProject();
  const t = useT();

  const [liens, setLiens] = useState<LinkRow[]>([]);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [role, setRole] = useState<'lecture' | 'edition'>('lecture');
  const [expiration, setExpiration] = useState<Expiration>('jamais');
  const [copie, setCopie] = useState<string | null>(null);

  const [shares, setShares] = useState<ShareRow[]>([]);
  const [emailOuvert, setEmailOuvert] = useState(false);
  const [email, setEmail] = useState('');
  const [roleEmail, setRoleEmail] = useState<'edition' | 'lecture'>('edition');

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!supabase || !projectId) return;
    // Les tokens mémorisés sont relus avec les liens, dans le callback : pas
    // de setState synchrone dans le corps de l'effet.
    listLinks(supabase, projectId)
      .then(l => { setLiens(l); setTokens(lireTokens(projectId)); })
      .catch(() => {});
    listShares(supabase, projectId).then(setShares).catch(() => {});
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!supabase) return <p className="text-xs text-muted">{t('share.unavailable')}</p>;
  if (!projectId) return <p className="text-xs text-faint">{t('share.loading')}</p>;
  if (!isOwner) return <p className="text-xs text-muted leading-snug">{t('share.sharedMsg')}</p>;

  const creerLien = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const { token, lien } = await createLink(
        supabase!, projectId, role, dateExpiration(expiration), '',
      );
      const majTokens = { ...lireTokens(projectId), [lien.id]: token };
      ecrireTokens(projectId, majTokens);
      setTokens(majTokens);
      setLiens(l => [lien, ...l]);
      await copier(lien.id, token);
    } catch (e) {
      setMsg(t('share.fail') + (e as Error).message);
    }
    setBusy(false);
  };

  const copier = async (linkId: string, token: string) => {
    const url = lienRejoindre(window.location.origin, token);
    try {
      await navigator.clipboard.writeText(url);
      setCopie(linkId);
      setTimeout(() => setCopie(c => (c === linkId ? null : c)), 2500);
    } catch {
      setMsg(url); // presse-papiers refusé : on affiche l'URL à copier à la main
    }
  };

  const revoquer = async (linkId: string) => {
    await revokeLink(supabase!, linkId).catch(() => {});
    const majTokens = lireTokens(projectId);
    delete majTokens[linkId];
    ecrireTokens(projectId, majTokens);
    setTokens(majTokens);
    setLiens(l => l.filter(x => x.id !== linkId));
  };

  const inviter = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes('@')) { setMsg(t('share.emailInvalid')); return; }
    setBusy(true);
    setMsg(null);
    try {
      await addShare(supabase!, projectId, e, roleEmail);
      setEmail('');
      setMsg(t('share.added'));
      refresh();
    } catch (err) {
      setMsg(t('share.fail') + (err as Error).message);
    }
    setBusy(false);
  };

  const boutonRole = (valeur: 'lecture' | 'edition', libelle: string, actif: boolean, onClick: () => void) => (
    <button
      key={valeur}
      onClick={onClick}
      className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
        actif ? 'bg-terracotta text-white border-terracotta' : 'bg-cream text-muted border-line hover:bg-line'
      }`}
    >
      {libelle}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* --- Lien privé --- */}
      <div className="space-y-2">
        <p className="text-xs text-muted leading-snug">{t('link.desc')}</p>

        <div className="flex gap-1">
          {boutonRole('lecture', t('share.readOnly'), role === 'lecture', () => setRole('lecture'))}
          {boutonRole('edition', t('share.canEdit'), role === 'edition', () => setRole('edition'))}
        </div>

        <label className="flex items-center justify-between gap-2 text-xs text-muted">
          {t('link.expires')}
          <select
            value={expiration}
            onChange={e => setExpiration(e.target.value as Expiration)}
            className="px-2 py-1 text-xs bg-cream border border-line rounded text-ink"
          >
            <option value="jamais">{t('link.never')}</option>
            <option value="7j">{t('link.days7')}</option>
            <option value="30j">{t('link.days30')}</option>
            <option value="90j">{t('link.days90')}</option>
          </select>
        </label>

        <button
          onClick={creerLien}
          disabled={busy}
          className="w-full px-3 py-2 text-sm bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors disabled:opacity-60"
        >
          {busy ? '…' : t('link.create')}
        </button>

        {liens.length > 0 && (
          <ul className="space-y-1">
            {liens.map(l => {
              const token = tokens[l.id];
              const actif = lienActif(l);
              return (
                <li key={l.id} className="px-2 py-1.5 text-xs bg-cream rounded space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={actif ? 'text-ink' : 'text-faint line-through'}>
                      {l.role === 'edition' ? t('share.roleEdit') : t('share.roleRead')}
                      {l.expires_at && (
                        <span className="text-faint">
                          {' · '}{new Date(l.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {token && actif && (
                        <button
                          onClick={() => copier(l.id, token)}
                          className="text-terracotta hover:text-ink transition-colors"
                        >
                          {copie === l.id ? t('link.copied') : t('link.copy')}
                        </button>
                      )}
                      <button
                        onClick={() => revoquer(l.id)}
                        className="text-faint hover:text-red-400"
                        aria-label={t('link.revoke')}
                        title={t('link.revoke')}
                      >
                        ×
                      </button>
                    </span>
                  </div>
                  {!token && actif && (
                    <p className="text-[10px] text-faint leading-snug">{t('link.lost')}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {msg && <p className="text-xs text-gold break-all">{msg}</p>}

      {/* --- Invitation par email (repliée) --- */}
      <div className="pt-1 border-t border-line">
        <button
          onClick={() => setEmailOuvert(o => !o)}
          className="w-full text-left text-[11px] text-faint hover:text-muted transition-colors py-1"
        >
          {emailOuvert ? '▾ ' : '▸ '}{t('link.orEmail')}
        </button>

        {emailOuvert && (
          <div className="space-y-2 pt-1">
            <p className="text-xs text-muted leading-snug">{t('share.desc')}</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !busy && inviter()}
              placeholder={t('share.emailPlaceholder')}
              className="w-full px-2 py-1 text-sm bg-cream border border-line rounded text-ink"
            />
            <div className="flex gap-1">
              {boutonRole('edition', t('share.canEdit'), roleEmail === 'edition', () => setRoleEmail('edition'))}
              {boutonRole('lecture', t('share.readOnly'), roleEmail === 'lecture', () => setRoleEmail('lecture'))}
            </div>
            <button
              onClick={inviter}
              disabled={busy}
              className="w-full px-3 py-2 text-sm bg-cream border border-line text-ink rounded hover:bg-line transition-colors disabled:opacity-60"
            >
              {busy ? '…' : t('share.invite')}
            </button>

            {shares.length > 0 && (
              <ul className="space-y-1">
                {shares.map(s => (
                  <li key={s.client_email} className="flex items-center justify-between gap-2 px-2 py-1 text-xs bg-cream rounded">
                    <span className="truncate">{s.client_email}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-faint">{s.role === 'edition' ? t('share.roleEdit') : t('share.roleRead')}</span>
                      <button
                        onClick={() => removeShare(supabase!, projectId, s.client_email).then(refresh).catch(() => {})}
                        className="text-faint hover:text-red-400"
                        aria-label="Retirer"
                      >
                        ×
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
