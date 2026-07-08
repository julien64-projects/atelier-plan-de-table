'use client';

import { useCallback } from 'react';
import { Group, Circle, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { TableOnPlan } from '@/lib/store/types';
import { etatCapacite, empreinte } from '@/lib/geometry/tableGeometry';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';

const BADGE_COLORS = {
  ok: '#22c55e',
  plein: '#f59e0b',
  depassement: '#ef4444',
} as const;

interface TableShapeProps {
  table: TableOnPlan;
}

export default function TableShape({ table }: TableShapeProps) {
  const { salleLargeurCm, salleHauteurCm, selectedTableId } = useRoomState();
  const dispatch = useRoomDispatch();
  const isSelected = selectedTableId === table.id;

  const tableInput = {
    shape: table.shape,
    diametreCm: table.diametreCm,
    longueurCm: table.longueurCm,
    largeurCm: table.largeurCm,
    confort: table.confort,
    bouts: table.bouts,
  };
  const etat = etatCapacite(tableInput, table.nbAssis);
  const badgeColor = BADGE_COLORS[etat.niveau];
  const emp = empreinte(tableInput);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    // Clamp dans les limites de la salle
    const halfW = emp.largeurCm / 2;
    const halfH = emp.profondeurCm / 2;
    const x = Math.max(halfW, Math.min(salleLargeurCm - halfW, e.target.x()));
    const y = Math.max(halfH, Math.min(salleHauteurCm - halfH, e.target.y()));
    e.target.x(x);
    e.target.y(y);
    dispatch({ type: 'MOVE_TABLE', id: table.id, x, y });
  }, [dispatch, table.id, emp.largeurCm, emp.profondeurCm, salleLargeurCm, salleHauteurCm]);

  const handleClick = useCallback(() => {
    dispatch({ type: 'SELECT_TABLE', id: table.id });
  }, [dispatch, table.id]);

  const handleMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = 'pointer';
  }, []);

  const handleMouseLeave = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = 'default';
  }, []);

  const strokeColor = isSelected ? '#2563eb' : '#8b7355';
  const strokeW = isSelected ? 4 : 2;

  if (table.shape === 'ronde') {
    const r = (table.diametreCm ?? 150) / 2;
    return (
      <Group
        x={table.pos_x}
        y={table.pos_y}
        draggable
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onTap={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Circle radius={r} fill="#e8dcc8" stroke={strokeColor} strokeWidth={strokeW} />
        <Text
          text={table.nom}
          x={-r}
          y={-10}
          width={r * 2}
          align="center"
          fontSize={14}
          fontStyle="bold"
          fill="#333"
          listening={false}
        />
        <Circle x={r * 0.7} y={-r * 0.7} radius={16} fill={badgeColor} listening={false} />
        <Text
          text={`${etat.assis}/${etat.max}`}
          x={r * 0.7 - 14}
          y={-r * 0.7 - 6}
          width={28}
          align="center"
          fontSize={10}
          fontStyle="bold"
          fill="white"
          listening={false}
        />
      </Group>
    );
  }

  // rect / banquet
  const w = table.longueurCm ?? 180;
  const h = table.largeurCm ?? 90;
  return (
    <Group
      x={table.pos_x}
      y={table.pos_y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        fill="#e8dcc8"
        stroke={strokeColor}
        strokeWidth={strokeW}
        cornerRadius={4}
      />
      <Text
        text={table.nom}
        x={-w / 2}
        y={-10}
        width={w}
        align="center"
        fontSize={14}
        fontStyle="bold"
        fill="#333"
        listening={false}
      />
      <Circle x={w / 2 - 5} y={-h / 2 - 5} radius={16} fill={badgeColor} listening={false} />
      <Text
        text={`${etat.assis}/${etat.max}`}
        x={w / 2 - 5 - 14}
        y={-h / 2 - 5 - 6}
        width={28}
        align="center"
        fontSize={10}
        fontStyle="bold"
        fill="white"
        listening={false}
      />
    </Group>
  );
}
