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
      <div className="px-5 py-5 border-b border-line bg-cream/60">
        <p className="text-[11px] uppercase tracking-[0.25em] text-terracotta font-medium">Atelier</p>
        <h1 className="text-2xl leading-tight text-ink mt-0.5">Plan de Table</h1>
        <p className="text-xs text-muted mt-1 italic">Composez votre salle de réception</p>
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
