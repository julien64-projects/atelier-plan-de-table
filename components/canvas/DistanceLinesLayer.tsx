'use client';

import { Layer, Line, Text } from 'react-konva';
import { useRoomState } from '@/lib/store/roomStore';
import { toutesLesDistances } from '@/lib/geometry/distanceGeometry';

const SEUIL_AFFICHAGE_CM = 300; // afficher les distances < 3m en permanence

interface DistanceLinesLayerProps {
  hoveredTableId: string | null;
}

export default function DistanceLinesLayer({ hoveredTableId }: DistanceLinesLayerProps) {
  const { tables, selectedTableId } = useRoomState();
  const activeId = hoveredTableId ?? selectedTableId;

  if (tables.length < 2) return <Layer />;

  const allDistances = toutesLesDistances(tables);

  return (
    <Layer listening={false}>
      {allDistances.map(({ a, b, result }) => {
        const isActive = activeId === a || activeId === b;
        const isClose = result.distanceCm < SEUIL_AFFICHAGE_CM;

        if (!isActive && !isClose) return null;

        const insuffisant = !result.allee.ok;
        const color = insuffisant ? '#ef4444' : '#22c55e';
        const midX = (result.fromPt.x + result.toPt.x) / 2;
        const midY = (result.fromPt.y + result.toPt.y) / 2;
        const label = insuffisant
          ? `⚠ ${(result.distanceCm / 100).toFixed(2)} m`
          : `${(result.distanceCm / 100).toFixed(1)} m`;

        return (
          <DistanceLine
            key={`${a}-${b}`}
            from={result.fromPt}
            to={result.toPt}
            color={color}
            label={label}
            midX={midX}
            midY={midY}
            isActive={isActive || insuffisant}
          />
        );
      })}
    </Layer>
  );
}

function DistanceLine({ from, to, color, label, midX, midY, isActive }: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  label: string;
  midX: number;
  midY: number;
  isActive: boolean;
}) {
  return (
    <>
      <Line
        points={[from.x, from.y, to.x, to.y]}
        stroke={color}
        strokeWidth={isActive ? 2 : 1}
        dash={[8, 4]}
      />
      <Text
        x={midX - 30}
        y={midY - 8}
        width={60}
        align="center"
        text={label}
        fontSize={11}
        fontStyle="bold"
        fill={color}
      />
    </>
  );
}
