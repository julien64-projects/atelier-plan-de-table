'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/supabase/AuthProvider';

/**
 * Petit contrôle « définir / changer le mot de passe », affiché dans le pied
 * de la barre latérale quand on est connecté. Permet à un compte créé par lien
 * magique de se doter d'un mot de passe pour se reconnecter simplement ensuite.
 */
export default function PasswordSetter() {
  const { setPassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (pw.length < 6) {
      setOk(false);
      setMsg('Au moins 6 caractères.');
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await setPassword(pw);
    setBusy(false);
    if (res.error) {
      setOk(false);
      setMsg(res.error);
    } else {
      setOk(true);
      setMsg('Mot de passe enregistré ✓ Tu peux désormais te connecter avec ton email et ce mot de passe.');
      setPw('');
    }
  };

  return (
    <div>
      <button
        onClick={() => { setOpen(o => !o); setMsg(null); }}
        className="text-xs text-muted hover:text-ink transition-colors"
      >
        {open ? 'Fermer' : 'Définir un mot de passe'}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !busy && submit()}
            placeholder="Nouveau mot de passe (min. 6)"
            autoComplete="new-password"
            className="w-full px-2 py-1 text-sm bg-cream border border-line rounded text-ink focus:outline-none focus:border-gold/60"
          />
          <button
            onClick={submit}
            disabled={busy}
            className="w-full px-3 py-1.5 text-xs rounded bg-gold/90 text-[#1a1114] font-medium hover:bg-gold transition-colors disabled:opacity-60"
          >
            {busy ? '…' : 'Enregistrer le mot de passe'}
          </button>
          {msg && (
            <p className={`text-xs ${ok ? 'text-gold' : 'text-terracotta'}`}>{msg}</p>
          )}
        </div>
      )}
    </div>
  );
}
