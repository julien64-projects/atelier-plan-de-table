'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { RoomProvider, useRoomDispatch } from '@/lib/store/roomStore';
import { GuestProvider } from '@/lib/store/guestStore';
import Sidebar from '@/components/sidebar/Sidebar';
import { decodeSetup } from '@/lib/share';

const RoomCanvas = dynamic(() => import('@/components/canvas/RoomCanvas'), { ssr: false });

/** Charge la configuration transmise par le planner (fragment du lien). */
function SetupLoader() {
  const dispatch = useRoomDispatch();
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    const setup = hash ? decodeSetup(hash) : null;
    if (setup) dispatch({ type: 'LOAD_SETUP', setup, mode: 'maries' });
    else dispatch({ type: 'SET_MODE', mode: 'maries' });
  }, [dispatch]);
  return null;
}

export default function Workspace({ maries = false }: { maries?: boolean }) {
  return (
    <RoomProvider>
      <GuestProvider>
        {maries && <SetupLoader />}
        <div className="flex h-screen w-screen overflow-hidden">
          <Sidebar />
          <RoomCanvas />
        </div>
      </GuestProvider>
    </RoomProvider>
  );
}
