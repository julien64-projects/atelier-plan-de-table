'use client';

import { Layer } from 'react-konva';
import { useRoomState } from '@/lib/store/roomStore';
import TableShape from './TableShape';

export default function TablesLayer() {
  const { tables } = useRoomState();
  return (
    <Layer>
      {tables.map(t => (
        <TableShape key={t.id} table={t} />
      ))}
    </Layer>
  );
}
