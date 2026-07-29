'use client';

import { Rect } from 'react-konva';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface RoomBorderProps {
  largeurCm: number;
  hauteurCm: number;
}

export default function RoomBorder({ largeurCm, hauteurCm }: RoomBorderProps) {
  const { canvas } = useTheme();
  return (
    <Rect
      x={0}
      y={0}
      width={largeurCm}
      height={hauteurCm}
      stroke={canvas.roomStroke}
      strokeWidth={2}
      fill={canvas.floor}
    />
  );
}
