'use client';

import { useRoomState } from '@/lib/store/roomStore';
import RoomConfig from './RoomConfig';
import TableCatalog from './TableCatalog';
import TableInspector from './TableInspector';
import GuestList from './GuestList';
import AlleeAlert from './AlleeAlert';

export default function Sidebar() {
  const { selectedTableId } = useRoomState();

  return (
    <aside className="w-72 border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800">Atelier Plan de Table</h1>
      </div>
      <div className="px-4 py-4 border-b border-gray-200">
        <RoomConfig />
      </div>
      <div className="px-4 py-3 border-b border-gray-200">
        <AlleeAlert />
      </div>
      <div className="px-4 py-4 border-b border-gray-200">
        {selectedTableId ? <TableInspector /> : (
          <>
            <h2 className="text-base font-semibold text-gray-700 mb-3">Ajouter une table</h2>
            <TableCatalog />
          </>
        )}
      </div>
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <GuestList />
      </div>
    </aside>
  );
}
