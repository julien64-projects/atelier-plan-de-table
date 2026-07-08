'use client';

import { useCallback, useState } from 'react';
import { TABLES_STANDARD, dimensionnerPour } from '@/lib/geometry/tableGeometry';
import { capaciteRonde, capaciteDroite } from '@/lib/geometry/tableGeometry';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import type { TableOnPlan } from '@/lib/store/types';
import type { TableShape } from '@/lib/types';

export default function TableCatalog() {
  const { nextTableNumber, salleLargeurCm, salleHauteurCm } = useRoomState();
  const dispatch = useRoomDispatch();
  const [nbConvives, setNbConvives] = useState(8);
  const [formeAuto, setFormeAuto] = useState<'ronde' | 'rect'>('ronde');

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

  const addTablePour = useCallback((n: number, shape: TableShape) => {
    const dim = dimensionnerPour(n, shape);
    if (dim.shape === 'ronde') {
      addTable({ shape: 'ronde', diametreCm: dim.diametreCm });
    } else {
      addTable({ shape: dim.shape, longueurCm: dim.longueurCm, largeurCm: dim.largeurCm, bouts: dim.bouts });
    }
  }, [addTable]);

  const apercu = dimensionnerPour(Math.max(1, nbConvives), formeAuto);

  return (
    <div className="space-y-4">
      {/* Auto-dimensionnement */}
      <div className="p-3 bg-gray-50 rounded-lg space-y-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pour N convives</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={30}
            value={nbConvives}
            onChange={e => setNbConvives(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <div className="flex gap-1">
            {(['ronde', 'rect'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFormeAuto(s)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  formeAuto === s
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {s === 'ronde' ? 'Ronde' : 'Droite'}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400">
          {apercu.shape === 'ronde'
            ? `Ø${apercu.diametreCm} cm`
            : `${apercu.longueurCm} × ${apercu.largeurCm} cm`}
          {' — '}{apercu.capacite} places
        </p>
        <button
          onClick={() => addTablePour(nbConvives, formeAuto)}
          className="w-full px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Créer la table
        </button>
      </div>

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
