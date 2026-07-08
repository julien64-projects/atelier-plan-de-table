'use client';

import { useCallback } from 'react';
import { DECORS_CATALOG } from '@/lib/decor';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';

export default function DecorCatalog() {
  const { salleLargeurCm, salleHauteurCm } = useRoomState();
  const dispatch = useRoomDispatch();

  const addDecor = useCallback((type: string, label: string, wCm: number, hCm: number) => {
    dispatch({
      type: 'ADD_DECOR',
      decor: {
        id: crypto.randomUUID(),
        type,
        label,
        w_cm: wCm,
        h_cm: hCm,
        pos_x: salleLargeurCm / 2,
        pos_y: salleHauteurCm / 2,
        rot: 0,
      },
    });
  }, [dispatch, salleLargeurCm, salleHauteurCm]);

  return (
    <div className="space-y-1">
      {DECORS_CATALOG.map(d => (
        <button
          key={d.type}
          onClick={() => addDecor(d.type, d.label, d.wCm, d.hCm)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-cream transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm border border-line" style={{ backgroundColor: d.couleur }} />
            {d.label}
          </span>
          <span className="text-faint">{d.wCm / 100} × {d.hCm / 100} m</span>
        </button>
      ))}
    </div>
  );
}
