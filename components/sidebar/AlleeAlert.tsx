'use client';

import { useMemo } from 'react';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { alleesInsuffisantes, tablesTropPresMur } from '@/lib/geometry/distanceGeometry';
import { ALLEE_SERVICE } from '@/lib/geometry/tableGeometry';
import { useT } from '@/lib/i18n/LangProvider';

const seuilM = (ALLEE_SERVICE / 100).toFixed(1).replace('.', ',');
const enM = (cm: number) => (cm / 100).toFixed(2).replace('.', ',');

export default function AlleeAlert() {
  const { tables, salleLargeurCm, salleHauteurCm } = useRoomState();
  const dispatch = useRoomDispatch();
  const t = useT();

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
    return <p className="text-xs text-sage">✓ {t('allee.serviceAisles')} ≥ {seuilM} m</p>;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-red-400">
        ⚠ {total} · {t('allee.serviceAisles')} &lt; {seuilM} m
      </p>
      <ul className="space-y-0.5">
        {violations.map(({ a, b, result }) => (
          <li key={`${a}-${b}`}>
            <button
              onClick={() => dispatch({ type: 'SELECT_TABLE', id: a })}
              className="w-full flex items-center justify-between px-2 py-1 text-xs rounded bg-red-500/10 hover:bg-red-500/20 text-red-300"
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
              className="w-full flex items-center justify-between px-2 py-1 text-xs rounded bg-red-500/10 hover:bg-red-500/20 text-red-300"
            >
              <span className="truncate">{tableNom} ↔ {t('wall.' + mur)}</span>
              <span className="font-medium whitespace-nowrap ml-2">
                {distanceCm < 0 ? t('allee.outside') : `${enM(distanceCm)} m`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
