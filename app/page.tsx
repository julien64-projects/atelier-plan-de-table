'use client';

import dynamic from 'next/dynamic';
import { RoomProvider } from '@/lib/store/roomStore';
import Sidebar from '@/components/sidebar/Sidebar';

const RoomCanvas = dynamic(() => import('@/components/canvas/RoomCanvas'), { ssr: false });

export default function Home() {
  return (
    <RoomProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar />
        <RoomCanvas />
      </div>
    </RoomProvider>
  );
}
