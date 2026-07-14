'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { useGuestState, useGuestDispatch } from '@/lib/store/guestStore';
import {
  getOrCreateProject,
  loadPlan,
  fetchPlan,
  pushPlan,
  type PlanSnapshot,
} from '@/lib/supabase/projectData';

const DEBOUNCE_MS = 600;      // écriture
const REALTIME_MS = 400;      // application d'un changement distant
const LOCAL_KEY = 'apt:v1:planner'; // ancienne sauvegarde localStorage

/** Lit l'ancien plan localStorage (avant Supabase), s'il contient des données. */
function readLocalPlan(): PlanSnapshot | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const room = d.room ?? {};
    const g = d.guest ?? {};
    const guests = g.guests ?? [];
    const tables = room.tables ?? [];
    const decors = room.decors ?? [];
    if (!guests.length && !tables.length && !decors.length) return null;
    return {
      salleLargeurCm: room.salleLargeurCm ?? 2000,
      salleHauteurCm: room.salleHauteurCm ?? 1500,
      nextTableNumber: room.nextTableNumber ?? tables.length + 1,
      tables,
      decors,
      guests,
      assignments: g.assignments ?? {},
    };
  } catch {
    return null;
  }
}

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

  // Ref toujours à jour sur l'état courant (pour les callbacks Realtime)
  const stateRef = useRef({ room, guest });
  useEffect(() => { stateRef.current = { room, guest }; });

  const snapshotFrom = (r: typeof room, g: typeof guest): PlanSnapshot => ({
    salleLargeurCm: r.salleLargeurCm,
    salleHauteurCm: r.salleHauteurCm,
    nextTableNumber: r.nextTableNumber,
    tables: r.tables,
    decors: r.decors,
    guests: g.guests,
    assignments: g.assignments,
  });

  // Snapshot courant de l'état à persister
  const snapshot = (): PlanSnapshot => snapshotFrom(room, guest);

  // Applique un plan (venu du chargement ou du Realtime) aux stores
  const hydrate = (plan: PlanSnapshot) => {
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
  };

  // 1. Bootstrap + chargement (une fois par utilisateur)
  useEffect(() => {
    if (!supabase || !user) return;
    let annule = false;
    (async () => {
      try {
        const project = await getOrCreateProject(supabase);
        const plan = await loadPlan(supabase, project);
        if (annule) return;

        // Reprise UNIQUE de l'ancien plan localStorage (invités + placements +
        // tables + décors) vers Supabase, si présent. Marqueur par projet pour
        // ne le faire qu'une fois (les éditions futures en base ne sont pas
        // écrasées).
        const migKey = `apt:migrated:${project.id}`;
        const local = readLocalPlan();
        let effectif = plan;
        if (!localStorage.getItem(migKey) && local && local.guests.length > 0) {
          console.info(`[ProjectSync] import du plan local : ${local.guests.length} invités, ${local.tables.length} tables.`);
          await pushPlan(supabase, project.id, local);
          effectif = local;
          try { localStorage.setItem(migKey, '1'); } catch {}
        }

        hydrate(effectif);
        lastSyncedRef.current = JSON.stringify(effectif);
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

  // 3. Realtime : appliquer les changements distants en direct
  useEffect(() => {
    if (!supabase || !projectId) return;
    let rtTimer: ReturnType<typeof setTimeout> | null = null;

    const applyRemote = async () => {
      try {
        const plan = await fetchPlan(supabase!, projectId);
        const serial = JSON.stringify(plan);
        if (serial === lastSyncedRef.current) return; // écho de notre propre écriture
        // Ne pas écraser des modifications locales non encore poussées
        const { room: r, guest: g } = stateRef.current;
        if (JSON.stringify(snapshotFrom(r, g)) !== lastSyncedRef.current) return;
        hydrate(plan);
        lastSyncedRef.current = serial;
      } catch (e) {
        console.error('[ProjectSync] synchro Realtime échouée', e);
      }
    };
    const schedule = () => {
      if (rtTimer) clearTimeout(rtTimer);
      rtTimer = setTimeout(applyRemote, REALTIME_MS);
    };

    const filter = `project_id=eq.${projectId}`;
    const channel = supabase
      .channel(`plan-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project', filter: `id=eq.${projectId}` }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_plan', filter }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'decor', filter }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest', filter }, schedule)
      // seat n'a pas de project_id ; la RLS ne livre que nos lignes
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seat' }, schedule)
      .subscribe();

    return () => {
      if (rtTimer) clearTimeout(rtTimer);
      supabase!.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return null;
}
