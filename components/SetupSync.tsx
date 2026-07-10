'use client';

import { useEffect, useRef } from 'react';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';

/**
 * Synchro en direct de la configuration (salle + mobilier) entre onglets
 * d'un MÊME navigateur, via BroadcastChannel. Le planner diffuse, les mariés
 * écoutent. La vraie synchro multi-appareils viendra avec Supabase.
 */
const CHANNEL = 'apt-setup-sync';

export default function SetupSync({ maries }: { maries: boolean }) {
  const { salleLargeurCm, salleHauteurCm, decors } = useRoomState();
  const dispatch = useRoomDispatch();
  const chanRef = useRef<BroadcastChannel | null>(null);

  // Ref toujours à jour avec la config courante (pour répondre aux demandes)
  const latest = useRef({ salleLargeurCm, salleHauteurCm, decors });
  latest.current = { salleLargeurCm, salleHauteurCm, decors };

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const chan = new BroadcastChannel(CHANNEL);
    chanRef.current = chan;

    chan.onmessage = (e) => {
      const data = e.data;
      if (maries) {
        if (data && typeof data.salleLargeurCm === 'number' && Array.isArray(data.decors)) {
          dispatch({ type: 'LOAD_SETUP', setup: data, mode: 'maries' });
        }
      } else if (data?.type === 'request-setup') {
        // Un onglet mariés vient d'ouvrir : on lui envoie la config courante
        chan.postMessage({ ...latest.current });
      }
    };

    // Mariés : demande la config courante à un éventuel planner ouvert
    if (maries) chan.postMessage({ type: 'request-setup' });

    return () => { chan.close(); chanRef.current = null; };
  }, [maries, dispatch]);

  // Planner : diffuse la config à chaque changement
  useEffect(() => {
    if (maries) return;
    chanRef.current?.postMessage({ salleLargeurCm, salleHauteurCm, decors });
  }, [maries, salleLargeurCm, salleHauteurCm, decors]);

  return null;
}
