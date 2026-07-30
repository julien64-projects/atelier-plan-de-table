'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useProject } from '@/lib/supabase/ProjectContext';
import { listShares, addShare, removeShare, type ShareRow } from '@/lib/supabase/projectData';

/**
 * Partage planner → mariés via Supabase (table project_share). Le planner
 * invite un email + rôle ; la personne se connecte avec CE MÊME email et
 * collabore sur le même projet en temps réel (Realtime déjà branché).
 */
export default function SharePanel() {
  const { projectId, isOwner } = useProject();
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'edition' | 'lecture'>('edition');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!supabase || !projectId) return;
    listShares(supabase, projectId).then(setShares).catch(() => {});
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!supabase) {
    return <p className="text-xs text-muted">Partage indisponible (connexion requise).</p>;
  }
  if (!projectId) {
    return <p className="text-xs text-faint">Chargement du projet…</p>;
  }
  if (!isOwner) {
    return (
      <p className="text-xs text-muted leading-snug">
        Ce projet vous a été partagé par le wedding planner. Vos modifications sont
        visibles par tout le monde <b>en temps réel</b>.
      </p>
    );
  }

  const inviter = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes('@')) { setMsg('Adresse email invalide.'); return; }
    setBusy(true);
    setMsg(null);
    try {
      await addShare(supabase!, projectId, e, role);
      setEmail('');
      setMsg('Invitation ajoutée ✓');
      refresh();
    } catch (err) {
      setMsg('Échec : ' + (err as Error).message);
    }
    setBusy(false);
  };

  const retirer = async (e: string) => {
    if (!projectId) return;
    await removeShare(supabase!, projectId, e).catch(() => {});
    refresh();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted leading-snug">
        Invitez les mariés par email. Ils créent un compte avec <b>ce même email</b> sur le
        site, puis modifient le plan avec vous <b>en temps réel</b>.
      </p>

      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !busy && inviter()}
        placeholder="email des mariés"
        className="w-full px-2 py-1 text-sm border border-line rounded"
      />

      <div className="flex gap-1">
        <button
          onClick={() => setRole('edition')}
          className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
            role === 'edition' ? 'bg-terracotta text-white border-terracotta' : 'bg-cream text-muted border-line hover:bg-line'
          }`}
        >
          Peut modifier
        </button>
        <button
          onClick={() => setRole('lecture')}
          className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
            role === 'lecture' ? 'bg-terracotta text-white border-terracotta' : 'bg-cream text-muted border-line hover:bg-line'
          }`}
        >
          Lecture seule
        </button>
      </div>

      <button
        onClick={inviter}
        disabled={busy}
        className="w-full px-3 py-2 text-sm bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors disabled:opacity-60"
      >
        {busy ? '…' : 'Inviter'}
      </button>

      {msg && <p className="text-xs text-gold">{msg}</p>}

      {shares.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-faint mb-1">Personnes invitées</p>
          <ul className="space-y-1">
            {shares.map(s => (
              <li key={s.client_email} className="flex items-center justify-between gap-2 px-2 py-1 text-xs bg-cream rounded">
                <span className="truncate">{s.client_email}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-faint">{s.role === 'edition' ? 'modifie' : 'lecture'}</span>
                  <button
                    onClick={() => retirer(s.client_email)}
                    className="text-faint hover:text-red-400"
                    aria-label="Retirer"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
