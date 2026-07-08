'use client';

import { Layer } from 'react-konva';
import { useRoomState } from '@/lib/store/roomStore';
import DecorShape from './DecorShape';

export default function DecorLayer() {
  const { decors } = useRoomState();
  return (
    <Layer>
      {decors.map(d => (
        <DecorShape key={d.id} decor={d} />
      ))}
    </Layer>
  );
}
