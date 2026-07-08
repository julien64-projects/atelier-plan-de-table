'use client';

import { Rect } from 'react-konva';

interface RoomBorderProps {
  largeurCm: number;
  hauteurCm: number;
}

export default function RoomBorder({ largeurCm, hauteurCm }: RoomBorderProps) {
  return (
    <Rect
      x={0}
      y={0}
      width={largeurCm}
      height={hauteurCm}
      stroke="#c9baa4"
      strokeWidth={2}
      fill="#fffdf9"
    />
  );
}
