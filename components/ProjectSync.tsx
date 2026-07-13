'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { useGuestState, useGuestDispatch } from '@/lib/store/guestStore';
import {
  getOrCreateProject,
  loadPlan,
  pushPlan,
  type PlanSnapshot,
} from '@/lib/supabase/projectData';

const DEBOUNCE_MS = 600;

/**
 * Relie le store au projet Supabase du planner : bootstrap + chargement à la
 * connexion, puis écriture debouncée à chaque changement. Remplace la
 * persistance localStorage côté planner. Aucun rendu.
 */
export default function ProjectSync() {
  const { user } = useAuth();
  const room = useRoomState();
  const roomDispatch = useRoomDispatch();
  const guest = useGuestState();
  const guestDispatch = useGuestDispatch();

  const [projectId, setProjectId] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const lastSyncedRef = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Snapshot courant de l'état à persister
  const snapshot = (): PlanSnapshot => ({
    salleLargeurCm: room.salleLargeurCm,
    salleHauteurCm: room.salleHauteurCm,
    nextTableNumber: room.nextTableNumber,
    tables: room.tables,
    decors: room.decors,
    guests: guest.guests,
    assignments: guest.assignments,
  });

  // 1. Bootstrap + chargement (une fois par utilisateur)
  useEffect(() => {
    if (!supabase || !user) return;
    let annule = false;
    (async () => {
      try {
        const project = await getOrCreateProject(supabase);
        const plan = await loadPlan(supabase, project);
        if (annule) return;
        // Hydrate les stores
        roomDispatch({
          type: 'LOAD_SETUP',
          setup: {
            salleLargeurCm: plan.salleLargeurCm,
            salleHauteurCm: plan.salleHauteurCm,
            decors: plan.decors,
          },
          mode: 'planner',
        });
        roomDispatch({ type: 'SET_TABLES', tables: plan.tables, nextTableNumber: plan.nextTableNumber });
        guestDispatch({ type: 'LOAD_GUESTS', guests: plan.guests, assignments: plan.assignments });
        lastSyncedRef.current = JSON.stringify(plan);
        loadedRef.current = true;
        setProjectId(project.id);
      } catch (e) {
        const err = e as { message?: string; code?: string; details?: string; hint?: string };
        console.error('[ProjectSync] chargement échoué —',
          'message:', err?.message,
          '| code:', err?.code,
          '| details:', err?.details,
          '| hint:', err?.hint,
          '| brut:', JSON.stringify(e));
      }
    })();
    return () => { annule = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 2. Écriture debouncée à chaque changement
  useEffect(() => {
    if (!supabase || !projectId || !loadedRef.current) return;
    const snap = snapshot();
    const serial = JSON.stringify(snap);
    if (serial === lastSyncedRef.current) return; // rien de neuf

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await pushPlan(supabase!, projectId, snap);
        lastSyncedRef.current = serial;
      } catch (e) {
        console.error('[ProjectSync] écriture échouée', e);
      }
    }, DEBOUNCE_MS);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectId,
    room.salleLargeurCm,
    room.salleHauteurCm,
    room.nextTableNumber,
    room.tables,
    room.decors,
    guest.guests,
    guest.assignments,
  ]);

  return null;
}
