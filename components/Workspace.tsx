'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { RoomProvider, useRoomDispatch } from '@/lib/store/roomStore';
import { GuestProvider } from '@/lib/store/guestStore';
import Sidebar from '@/components/sidebar/Sidebar';
import Persistence from '@/components/Persistence';
import SetupSync from '@/components/SetupSync';
import { useGuestDispatch } from '@/lib/store/guestStore';
import { decodePlan } from '@/lib/share';

const RoomCanvas = dynamic(() => import('@/components/canvas/RoomCanvas'), { ssr: false });

const IMPORT_KEY = 'apt:imported';

/** Charge le plan transmis par le planner (fragment du lien). */
function SetupLoader() {
  const roomDispatch = useRoomDispatch();
  const guestDispatch = useGuestDispatch();
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    const plan = hash ? decodePlan(hash) : null;
    if (!plan) {
      roomDispatch({ type: 'SET_MODE', mode: 'maries' });
      return;
    }
    // Salle + mobilier : toujours appliqués (le planner en est maître)
    roomDispatch({
      type: 'LOAD_SETUP',
      setup: { salleLargeurCm: plan.salleLargeurCm, salleHauteurCm: plan.salleHauteurCm, decors: plan.decors },
      mode: 'maries',
    });
    // Tables + invités : import UNIQUE par lien, pour ne pas écraser les
    // modifications des mariés à chaque rafraîchissement.
    const sig = hash.slice(0, 48);
    let dejaImporte = false;
    try { dejaImporte = localStorage.getItem(IMPORT_KEY) === sig; } catch {}
    if (!dejaImporte) {
      roomDispatch({ type: 'SET_TABLES', tables: plan.tables, nextTableNumber: plan.nextTableNumber });
      guestDispatch({ type: 'LOAD_GUESTS', guests: plan.guests, assignments: plan.assignments });
      try { localStorage.setItem(IMPORT_KEY, sig); } catch {}
    }
  }, [roomDispatch, guestDispatch]);
  return null;
}

export default function Workspace({ maries = false }: { maries?: boolean }) {
  // Clé de sauvegarde stable : régénérer/rouvrir un lien mis à jour met à jour
  // la salle+mobilier (via le lien) sans faire perdre aux mariés leurs tables.
  const planId = maries ? 'maries' : 'planner';
  return (
    <RoomProvider>
      <GuestProvider>
        <Persistence planId={planId} />
        {maries && <SetupLoader />}
        <SetupSync maries={maries} />
        <div className="flex h-screen w-screen overflow-hidden">
          <Sidebar />
          <RoomCanvas />
        </div>
      </GuestProvider>
    </RoomProvider>
  );
}
