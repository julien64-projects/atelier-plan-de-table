'use client';

import { Layer, Text } from 'react-konva';
import { useRoomState } from '@/lib/store/roomStore';
import { useTheme } from '@/lib/theme/ThemeProvider';

/**
 * Étiquettes de dimensions des tables, affichées en mode « Plan technique ».
 * Ronde : « Ø 150 cm » ; droite : « 180 × 90 cm ». Positionnées sous le centre
 * de la table. Non interactif (listening=false).
 */
export default function TableDimensionsLayer() {
  const { tables } = useRoomState();
  const { canvas } = useTheme();

  return (
    <Layer listening={false}>
      {tables.map(t => {
        const label = t.shape === 'ronde'
          ? `Ø ${Math.round(t.diametreCm ?? 150)} cm`
          : `${Math.round(t.longueurCm ?? 180)} × ${Math.round(t.largeurCm ?? 90)} cm`;
        return (
          <Text
            key={t.id}
            x={t.pos_x - 150}
            y={t.pos_y + 6}
            width={300}
            align="center"
            text={label}
            fontSize={13}
            fontStyle="bold"
            fill={canvas.dim}
          />
        );
      })}
    </Layer>
  );
}
