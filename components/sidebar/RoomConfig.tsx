'use client';

import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';

export default function RoomConfig() {
  const { salleLargeurCm, salleHauteurCm } = useRoomState();
  const dispatch = useRoomDispatch();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Salle</h3>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 w-16">Largeur</label>
        <input
          type="number"
          min={1}
          step={1}
          value={Math.round(salleLargeurCm / 100)}
          onChange={e => {
            const m = Math.max(1, Number(e.target.value));
            dispatch({ type: 'SET_ROOM_SIZE', largeurCm: m * 100, hauteurCm: salleHauteurCm });
          }}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
        />
        <span className="text-sm text-gray-400">m</span>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 w-16">Hauteur</label>
        <input
          type="number"
          min={1}
          step={1}
          value={Math.round(salleHauteurCm / 100)}
          onChange={e => {
            const m = Math.max(1, Number(e.target.value));
            dispatch({ type: 'SET_ROOM_SIZE', largeurCm: salleLargeurCm, hauteurCm: m * 100 });
          }}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
        />
        <span className="text-sm text-gray-400">m</span>
      </div>
    </div>
  );
}
