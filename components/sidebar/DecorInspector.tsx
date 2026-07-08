'use client';

import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';

export default function DecorInspector() {
  const { decors, selectedDecorId } = useRoomState();
  const dispatch = useRoomDispatch();
  const decor = decors.find(d => d.id === selectedDecorId);
  if (!decor) return null;

  const num = (v: string, min: number) => Math.max(min, Number(v) || 0);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-700">Décor sélectionné</h2>

      {/* Libellé */}
      <div>
        <label className="text-sm text-gray-500">Libellé</label>
        <input
          type="text"
          value={decor.label}
          onChange={e => dispatch({ type: 'UPDATE_DECOR', id: decor.id, changes: { label: e.target.value } })}
          className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded"
        />
      </div>

      {/* Dimensions */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-sm text-gray-500">Largeur (cm)</label>
          <input
            type="number"
            min={20}
            step={10}
            value={decor.w_cm}
            onChange={e => dispatch({ type: 'UPDATE_DECOR', id: decor.id, changes: { w_cm: num(e.target.value, 20) } })}
            className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm text-gray-500">Hauteur (cm)</label>
          <input
            type="number"
            min={20}
            step={10}
            value={decor.h_cm}
            onChange={e => dispatch({ type: 'UPDATE_DECOR', id: decor.id, changes: { h_cm: num(e.target.value, 20) } })}
            className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label className="text-sm text-gray-500">Rotation</label>
        <div className="mt-1 flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'UPDATE_DECOR', id: decor.id, changes: { rot: (decor.rot + 90) % 360 } })}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          >
            Pivoter 90°
          </button>
          <span className="text-sm text-gray-500">{decor.rot}°</span>
        </div>
      </div>

      {/* Supprimer */}
      <button
        onClick={() => dispatch({ type: 'REMOVE_DECOR', id: decor.id })}
        className="w-full mt-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        Supprimer ce décor
      </button>
    </div>
  );
}
