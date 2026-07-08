'use client';

import { Layer } from 'react-konva';
import { useRoomState } from '@/lib/store/roomStore';
import TableShape from './TableShape';

interface TablesLayerProps {
  onHover?: (id: string | null) => void;
}

export default function TablesLayer({ onHover }: TablesLayerProps) {
  const { tables } = useRoomState();
  return (
    <Layer>
      {tables.map(t => (
        <TableShape key={t.id} table={t} onHover={onHover} />
      ))}
    </Layer>
  );
}
