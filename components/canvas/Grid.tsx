'use client';

import { Line } from 'react-konva';

interface GridProps {
  largeurCm: number;
  hauteurCm: number;
}

export default function Grid({ largeurCm, hauteurCm }: GridProps) {
  const lines: React.JSX.Element[] = [];

  // Lignes verticales
  for (let x = 0; x <= largeurCm; x += 100) {
    const isBold = x % 500 === 0;
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, hauteurCm]}
        stroke={isBold ? '#d3c6b0' : '#e6ddcc'}
        strokeWidth={isBold ? 1.5 : 0.5}
      />
    );
  }

  // Lignes horizontales
  for (let y = 0; y <= hauteurCm; y += 100) {
    const isBold = y % 500 === 0;
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, largeurCm, y]}
        stroke={isBold ? '#d3c6b0' : '#e6ddcc'}
        strokeWidth={isBold ? 1.5 : 0.5}
      />
    );
  }

  return <>{lines}</>;
}
