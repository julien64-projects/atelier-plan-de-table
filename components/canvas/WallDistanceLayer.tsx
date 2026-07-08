'use client';

import { Fragment } from 'react';
import { Layer, Line, Text } from 'react-konva';
import { useRoomState } from '@/lib/store/roomStore';
import { empreinte } from '@/lib/geometry/tableGeometry';
import { distanceAuxMurs, type Mur } from '@/lib/geometry/distanceGeometry';

const enM = (cm: number) => (cm / 100).toFixed(2).replace('.', ',');

export default function WallDistanceLayer() {
  const { tables, salleLargeurCm, salleHauteurCm, selectedTableId } = useRoomState();
  const table = tables.find(t => t.id === selectedTableId);
  if (!table) return <Layer listening={false} />;

  const emp = empreinte(table);
  const halfW = emp.largeurCm / 2;
  const halfH = emp.profondeurCm / 2;
  const murs = distanceAuxMurs(table, salleLargeurCm, salleHauteurCm);

  // Segment du bord d'empreinte jusqu'au mur, pour chaque côté
  const segments: Record<Mur, { x1: number; y1: number; x2: number; y2: number }> = {
    gauche: { x1: table.pos_x - halfW, y1: table.pos_y, x2: 0, y2: table.pos_y },
    droite: { x1: table.pos_x + halfW, y1: table.pos_y, x2: salleLargeurCm, y2: table.pos_y },
    haut: { x1: table.pos_x, y1: table.pos_y - halfH, x2: table.pos_x, y2: 0 },
    bas: { x1: table.pos_x, y1: table.pos_y + halfH, x2: table.pos_x, y2: salleHauteurCm },
  };

  return (
    <Layer listening={false}>
      {murs.map(({ mur, distanceCm, allee }) => {
        const seg = segments[mur];
        const color = allee.ok ? '#3b82f6' : '#ef4444';
        const midX = (seg.x1 + seg.x2) / 2;
        const midY = (seg.y1 + seg.y2) / 2;
        const label = distanceCm < 0 ? 'hors salle' : `${enM(distanceCm)} m`;
        return (
          <Fragment key={mur}>
            <Line points={[seg.x1, seg.y1, seg.x2, seg.y2]} stroke={color} strokeWidth={1} dash={[6, 4]} />
            <Text
              x={midX - 30}
              y={midY - 7}
              width={60}
              align="center"
              text={label}
              fontSize={11}
              fontStyle="bold"
              fill={color}
            />
          </Fragment>
        );
      })}
    </Layer>
  );
}
