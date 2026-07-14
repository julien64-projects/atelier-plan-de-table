'use client';

import { Layer } from 'react-konva';
import { useRoomState } from '@/lib/store/roomStore';
import TableShape from './TableShape';
import DecorShape from './DecorShape';

interface PlanObjectsLayerProps {
  onHover?: (id: string | null) => void;
}

/**
 * Calque unique tables + décors, empilés par `ordre` (le dernier ajouté au
 * dessus). À ordre égal, les décors sont placés avant les tables (mobilier de
 * fond sous les tables) grâce à l'ordre de construction + tri stable.
 */
export default function PlanObjectsLayer({ onHover }: PlanObjectsLayerProps) {
  const { tables, decors } = useRoomState();

  const items: { z: number; node: React.ReactNode }[] = [
    ...decors.map(d => ({ z: d.ordre ?? 0, node: <DecorShape key={`d-${d.id}`} decor={d} /> })),
    ...tables.map(t => ({ z: t.ordre ?? 0, node: <TableShape key={`t-${t.id}`} table={t} onHover={onHover} /> })),
  ].sort((a, b) => a.z - b.z);

  return <Layer>{items.map(i => i.node)}</Layer>;
}
