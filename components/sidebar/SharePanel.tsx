'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useProject } from '@/lib/supabase/ProjectContext';
import { useT } from '@/lib/i18n/LangProvider';
import { listShares, addShare, removeShare, type ShareRow } from '@/lib/supabase/projectData';

/**
 * Partage planner → mariés via Supabase (table project_share). Le planner
 * invite un email + rôle ; la personne se connecte avec CE MÊME email et
 * collabore sur le même projet en temps réel (Realtime déjà branché).
 */
export default function SharePanel() {
  const { projectId, isOwner } = useProject();
  const t = useT();
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
    return <p className="text-xs text-muted">{t('share.unavailable')}</p>;
  }
  if (!projectId) {
    return <p className="text-xs text-faint">{t('share.loading')}</p>;
  }
  if (!isOwner) {
    return <p className="text-xs text-muted leading-snug">{t('share.sharedMsg')}</p>;
  }

  const inviter = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes('@')) { setMsg(t('share.emailInvalid')); return; }
    setBusy(true);
    setMsg(null);
    try {
      await addShare(supabase!, projectId, e, role);
      setEmail('');
      setMsg(t('share.added'));
      refresh();
    } catch (err) {
      setMsg(t('share.fail') + (err as Error).message);
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
      <p className="text-xs text-muted leading-snug">{t('share.desc')}</p>

      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !busy && inviter()}
        placeholder={t('share.emailPlaceholder')}
        className="w-full px-2 py-1 text-sm border border-line rounded"
      />

      <div className="flex gap-1">
        <button
          onClick={() => setRole('edition')}
          className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
            role === 'edition' ? 'bg-terracotta text-white border-terracotta' : 'bg-cream text-muted border-line hover:bg-line'
          }`}
        >
          {t('share.canEdit')}
        </button>
        <button
          onClick={() => setRole('lecture')}
          className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
            role === 'lecture' ? 'bg-terracotta text-white border-terracotta' : 'bg-cream text-muted border-line hover:bg-line'
          }`}
        >
          {t('share.readOnly')}
        </button>
      </div>

      <button
        onClick={inviter}
        disabled={busy}
        className="w-full px-3 py-2 text-sm bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors disabled:opacity-60"
      >
        {busy ? '…' : t('share.invite')}
      </button>

      {msg && <p className="text-xs text-gold">{msg}</p>}

      {shares.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-faint mb-1">{t('share.invited')}</p>
          <ul className="space-y-1">
            {shares.map(s => (
              <li key={s.client_email} className="flex items-center justify-between gap-2 px-2 py-1 text-xs bg-cream rounded">
                <span className="truncate">{s.client_email}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-faint">{s.role === 'edition' ? t('share.roleEdit') : t('share.roleRead')}</span>
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
