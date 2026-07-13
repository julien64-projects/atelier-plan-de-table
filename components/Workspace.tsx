'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { RoomProvider, useRoomDispatch } from '@/lib/store/roomStore';
import { GuestProvider } from '@/lib/store/guestStore';
import Sidebar from '@/components/sidebar/Sidebar';
import Persistence from '@/components/Persistence';
import ProjectSync from '@/components/ProjectSync';
import SetupSync from '@/components/SetupSync';
import { useAuth } from '@/lib/supabase/AuthProvider';
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

function WorkspaceInner() {
  // Interface rendue uniquement après montage client : l'état (mode,
  // localStorage, lien) n'est stable qu'à ce moment, ce qui évite tout
  // décalage d'hydratation serveur/client.
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Fond sombre du drawer (mobile / tablette < lg uniquement) */}
      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden
        className={`lg:hidden fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar unique : ancrée à gauche sur desktop, panneau coulissant sinon */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 h-full shrink-0 transition-transform duration-300 lg:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setDrawerOpen(false)} />
      </div>

      {/* Canevas : occupe l'espace restant */}
      <div className="relative flex-1 min-w-0 h-full flex">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Ouvrir le menu"
          className="lg:hidden absolute top-4 left-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-surface/90 border border-line text-ink shadow-sm"
        >
          <span className="text-lg leading-none">☰</span>
        </button>
        <RoomCanvas />
      </div>
    </div>
  );
}

export default function Workspace({ maries = false }: { maries?: boolean }) {
  // Clé de sauvegarde stable : régénérer/rouvrir un lien mis à jour met à jour
  // la salle+mobilier (via le lien) sans faire perdre aux mariés leurs tables.
  const planId = maries ? 'maries' : 'planner';
  const { configured, session } = useAuth();
  // Côté planner connecté à Supabase : la base fait foi (ProjectSync).
  // Sinon (mariés, ou Supabase non configuré) : persistance locale + lien.
  const useSupabase = !maries && configured && !!session;
  return (
    <RoomProvider>
      <GuestProvider>
        {useSupabase ? (
          <ProjectSync />
        ) : (
          <>
            <Persistence planId={planId} />
            <SetupSync maries={maries} />
          </>
        )}
        {maries && <SetupLoader />}
        <WorkspaceInner />
      </GuestProvider>
    </RoomProvider>
  );
}
