'use client';

import { useRoomState } from '@/lib/store/roomStore';
import RoomConfig from './RoomConfig';
import TableCatalog from './TableCatalog';
import TableInspector from './TableInspector';
import DecorCatalog from './DecorCatalog';
import DecorInspector from './DecorInspector';
import GuestList from './GuestList';
import AlleeAlert from './AlleeAlert';
import SharePanel from './SharePanel';

function Header({ sous }: { sous: string }) {
  return (
    <div className="px-5 py-6 border-b border-line text-center">
      <p className="text-[10px] uppercase tracking-[0.3em] text-blush font-semibold">L&apos;Atelier</p>
      <h1 className="text-[27px] leading-tight text-ink mt-1">Plan de Table</h1>
      <div className="flex items-center justify-center gap-3 text-gold my-2.5">
        <span className="h-px w-8 bg-gold/50" />
        <span className="text-xs">&#10086;</span>
        <span className="h-px w-8 bg-gold/50" />
      </div>
      <p className="text-xs text-muted italic">{sous}</p>
    </div>
  );
}

export default function Sidebar() {
  const { mode, selectedTableId, selectedDecorId, salleLargeurCm, salleHauteurCm } = useRoomState();

  if (mode === 'planner') {
    return (
      <aside className="w-80 border-r border-line bg-surface flex flex-col overflow-y-auto">
        <Header sous="Espace wedding planner" />
        <div className="px-5 py-4 border-b border-line">
          <RoomConfig />
        </div>
        <div className="flex-1 px-5 py-4 border-b border-line overflow-y-auto space-y-5">
          <div>
            <h2 className="text-lg text-ink mb-3">Mobilier de la salle</h2>
            <DecorCatalog />
          </div>
          {selectedDecorId && (
            <div className="pt-4 border-t border-line">
              <DecorInspector />
            </div>
          )}
        </div>
        <div className="px-5 py-4">
          <SharePanel />
        </div>
      </aside>
    );
  }

  // Mode mariés : salle & mobilier reçus (verrouillés), focus tables + invités
  return (
    <aside className="w-80 border-r border-line bg-surface flex flex-col overflow-y-auto">
      <Header sous="Espace mariés" />
      <div className="px-5 py-3 border-b border-line">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Salle</p>
        <p className="text-sm text-ink">
          {Math.round(salleLargeurCm / 100)} × {Math.round(salleHauteurCm / 100)} m
          <span className="text-faint"> · définie par votre planner</span>
        </p>
      </div>
      <div className="px-5 py-3 border-b border-line">
        <AlleeAlert />
      </div>
      <div className="px-5 py-4 border-b border-line space-y-5">
        <div>
          <h2 className="text-lg text-ink mb-3">Ajouter une table</h2>
          <TableCatalog />
        </div>
        {selectedTableId && (
          <div className="pt-4 border-t border-line">
            <TableInspector />
          </div>
        )}
      </div>
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <GuestList />
      </div>
    </aside>
  );
}
