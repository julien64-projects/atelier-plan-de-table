'use client';

import { useEffect, useRef } from 'react';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { useGuestState, useGuestDispatch } from '@/lib/store/guestStore';

/**
 * Sauvegarde locale (localStorage) de l'état de travail, pour ne rien perdre
 * au rafraîchissement. Remplacée à terme par Supabase.
 *
 * Côté mariés, la salle et le mobilier sont réappliqués depuis le lien après
 * l'hydratation (voir SetupLoader), donc c'est le lien qui fait foi pour eux.
 */
export default function Persistence({ planId }: { planId: string }) {
  const room = useRoomState();
  const roomDispatch = useRoomDispatch();
  const guest = useGuestState();
  const guestDispatch = useGuestDispatch();
  const hydrated = useRef(false);
  const key = `apt:v1:${planId}`;

  // Hydratation (une fois)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.room) roomDispatch({ type: 'LOAD_STATE', state: data.room });
        if (data.guest) {
          guestDispatch({
            type: 'LOAD_GUESTS',
            guests: data.guest.guests ?? [],
            assignments: data.guest.assignments ?? {},
          });
        }
      }
    } catch {
      /* localStorage indisponible ou données corrompues : on ignore */
    }
    hydrated.current = true;
  }, [key, roomDispatch, guestDispatch]);

  // Sauvegarde à chaque changement (après hydratation)
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      const data = {
        room: { ...room, selectedTableId: null, selectedDecorId: null },
        guest: { guests: guest.guests, assignments: guest.assignments },
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      /* quota dépassé ou indisponible : on ignore */
    }
  }, [key, room, guest.guests, guest.assignments]);

  return null;
}
