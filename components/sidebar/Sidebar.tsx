'use client';

import { useRoomState } from '@/lib/store/roomStore';
import RoomConfig from './RoomConfig';
import TableCatalog from './TableCatalog';
import TableInspector from './TableInspector';
import DecorCatalog from './DecorCatalog';
import DecorInspector from './DecorInspector';
import GuestList from './GuestList';
import AlleeAlert from './AlleeAlert';

export default function Sidebar() {
  const { selectedTableId, selectedDecorId } = useRoomState();

  return (
    <aside className="w-80 border-r border-line bg-surface flex flex-col overflow-y-auto">
      <div className="px-5 py-6 border-b border-line text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-terracotta font-semibold">L&apos;Atelier</p>
        <h1 className="text-[27px] leading-tight text-ink mt-1">Plan de Table</h1>
        <div className="flex items-center justify-center gap-3 text-gold my-2.5">
          <span className="h-px w-8 bg-gold/50" />
          <span className="text-xs">&#10086;</span>
          <span className="h-px w-8 bg-gold/50" />
        </div>
        <p className="text-xs text-muted italic">Composez votre salle de réception</p>
      </div>
      <div className="px-5 py-4 border-b border-line">
        <RoomConfig />
      </div>
      <div className="px-5 py-4 border-b border-line">
        <AlleeAlert />
      </div>
      <div className="px-5 py-4 border-b border-line">
        {selectedTableId ? <TableInspector /> : selectedDecorId ? <DecorInspector /> : (
          <>
            <h2 className="text-lg text-ink mb-3">Ajouter une table</h2>
            <TableCatalog />
            <h2 className="text-lg text-ink mt-6 mb-3">Ajouter un décor</h2>
            <DecorCatalog />
          </>
        )}
      </div>
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <GuestList />
      </div>
    </aside>
  );
}
