'use client';

import { useCallback } from 'react';
import { TABLES_STANDARD } from '@/lib/geometry/tableGeometry';
import { capaciteRonde, capaciteDroite } from '@/lib/geometry/tableGeometry';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import type { TableOnPlan } from '@/lib/store/types';

export default function TableCatalog() {
  const { nextTableNumber, salleLargeurCm, salleHauteurCm } = useRoomState();
  const dispatch = useRoomDispatch();

  const addTable = useCallback((table: Omit<TableOnPlan, 'id' | 'nom' | 'pos_x' | 'pos_y' | 'rot' | 'confort' | 'bouts'> & { bouts?: boolean }) => {
    const newTable: TableOnPlan = {
      ...table,
      id: crypto.randomUUID(),
      nom: `Table ${nextTableNumber}`,
      confort: 'standard',
      bouts: table.bouts ?? false,
      pos_x: salleLargeurCm / 2,
      pos_y: salleHauteurCm / 2,
      rot: 0,
    };
    dispatch({ type: 'ADD_TABLE', table: newTable });
  }, [dispatch, nextTableNumber, salleLargeurCm, salleHauteurCm]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Rondes</h3>
        <div className="space-y-1">
          {TABLES_STANDARD.ronde.map(t => (
            <button
              key={t.diametreCm}
              onClick={() => addTable({ shape: 'ronde', diametreCm: t.diametreCm })}
              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span>{t.label}</span>
              <span className="text-gray-400">{capaciteRonde(t.diametreCm)} places</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Rectangulaires</h3>
        <div className="space-y-1">
          {TABLES_STANDARD.droite.map(t => (
            <button
              key={t.longueurCm}
              onClick={() => addTable({ shape: 'rect', longueurCm: t.longueurCm, largeurCm: t.largeurCm })}
              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span>{t.label}</span>
              <span className="text-gray-400">{capaciteDroite(t.longueurCm)} places</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
