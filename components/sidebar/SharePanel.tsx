'use client';

import { useState } from 'react';
import { useRoomState } from '@/lib/store/roomStore';
import { lienMaries } from '@/lib/share';

export default function SharePanel() {
  const { salleLargeurCm, salleHauteurCm, decors } = useRoomState();
  const [lien, setLien] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  const generer = () => {
    const url = lienMaries(window.location.origin, { salleLargeurCm, salleHauteurCm, decors });
    setLien(url);
    navigator.clipboard?.writeText(url)
      .then(() => { setCopie(true); setTimeout(() => setCopie(false), 2500); })
      .catch(() => {});
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg text-ink">Partager aux mariés</h2>
      <p className="text-xs text-muted">
        Transmettez la salle et le mobilier aux mariés. Ils pourront ajouter et placer
        leurs tables et invités, sans modifier votre installation.
      </p>
      <button
        onClick={generer}
        className="w-full px-3 py-2 text-sm bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors"
      >
        {copie ? 'Lien copié ✓' : 'Générer le lien de partage'}
      </button>
      {lien && (
        <div className="space-y-1">
          <input
            readOnly
            value={lien}
            onFocus={e => e.currentTarget.select()}
            className="w-full px-2 py-1 text-xs border border-line rounded text-muted"
          />
          <p className="text-[11px] text-faint italic">
            Copiez ce lien et envoyez-le aux mariés.
          </p>
        </div>
      )}
    </div>
  );
}
