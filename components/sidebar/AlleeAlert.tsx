'use client';

import { useMemo } from 'react';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { alleesInsuffisantes, tablesTropPresMur, libelleMur } from '@/lib/geometry/distanceGeometry';
import { ALLEE_SERVICE } from '@/lib/geometry/tableGeometry';

const seuilM = (ALLEE_SERVICE / 100).toFixed(1).replace('.', ',');
const enM = (cm: number) => (cm / 100).toFixed(2).replace('.', ',');

export default function AlleeAlert() {
  const { tables, salleLargeurCm, salleHauteurCm } = useRoomState();
  const dispatch = useRoomDispatch();

  const violations = useMemo(() => alleesInsuffisantes(tables), [tables]);
  const murs = useMemo(
    () => tablesTropPresMur(tables, salleLargeurCm, salleHauteurCm),
    [tables, salleLargeurCm, salleHauteurCm],
  );
  const nomsById = useMemo(
    () => Object.fromEntries(tables.map(t => [t.id, t.nom])),
    [tables],
  );

  const total = violations.length + murs.length;

  if (total === 0) {
    return <p className="text-xs text-green-600">✓ Allées de service ≥ {seuilM} m</p>;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-red-600">
        ⚠ {total} allée{total > 1 ? 's' : ''} de service &lt; {seuilM} m
      </p>
      <ul className="space-y-0.5">
        {violations.map(({ a, b, result }) => (
          <li key={`${a}-${b}`}>
            <button
              onClick={() => dispatch({ type: 'SELECT_TABLE', id: a })}
              className="w-full flex items-center justify-between px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-100 text-red-700"
            >
              <span className="truncate">{nomsById[a]} ↔ {nomsById[b]}</span>
              <span className="font-medium whitespace-nowrap ml-2">{enM(result.distanceCm)} m</span>
            </button>
          </li>
        ))}
        {murs.map(({ tableId, tableNom, mur, distanceCm }) => (
          <li key={`${tableId}-${mur}`}>
            <button
              onClick={() => dispatch({ type: 'SELECT_TABLE', id: tableId })}
              className="w-full flex items-center justify-between px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-100 text-red-700"
            >
              <span className="truncate">{tableNom} ↔ {libelleMur(mur)}</span>
              <span className="font-medium whitespace-nowrap ml-2">
                {distanceCm < 0 ? 'hors salle' : `${enM(distanceCm)} m`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
