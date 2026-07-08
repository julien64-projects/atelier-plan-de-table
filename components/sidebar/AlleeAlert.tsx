'use client';

import { useMemo } from 'react';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { alleesInsuffisantes } from '@/lib/geometry/distanceGeometry';
import { ALLEE_SERVICE } from '@/lib/geometry/tableGeometry';

export default function AlleeAlert() {
  const { tables } = useRoomState();
  const dispatch = useRoomDispatch();

  const violations = useMemo(() => alleesInsuffisantes(tables), [tables]);
  const nomsById = useMemo(
    () => Object.fromEntries(tables.map(t => [t.id, t.nom])),
    [tables],
  );

  if (violations.length === 0) {
    return (
      <p className="text-xs text-green-600">
        ✓ Allées de service ≥ {(ALLEE_SERVICE / 100).toFixed(1).replace('.', ',')} m
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold text-red-600">
        ⚠ {violations.length} allée{violations.length > 1 ? 's' : ''} de service trop étroite{violations.length > 1 ? 's' : ''}
        {' '}(&lt; {(ALLEE_SERVICE / 100).toFixed(1).replace('.', ',')} m)
      </p>
      <ul className="space-y-0.5">
        {violations.map(({ a, b, result }) => (
          <li key={`${a}-${b}`}>
            <button
              onClick={() => dispatch({ type: 'SELECT_TABLE', id: a })}
              className="w-full flex items-center justify-between px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-100 text-red-700"
            >
              <span className="truncate">{nomsById[a]} ↔ {nomsById[b]}</span>
              <span className="font-medium whitespace-nowrap ml-2">
                {(result.distanceCm / 100).toFixed(2).replace('.', ',')} m
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
