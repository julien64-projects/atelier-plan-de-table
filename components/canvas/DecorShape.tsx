'use client';

import { useCallback } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { DecorOnPlan } from '@/lib/store/types';
import { couleurDecor } from '@/lib/decor';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';

export default function DecorShape({ decor }: { decor: DecorOnPlan }) {
  const { salleLargeurCm, salleHauteurCm, selectedDecorId } = useRoomState();
  const dispatch = useRoomDispatch();
  const isSelected = selectedDecorId === decor.id;

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const halfW = decor.w_cm / 2;
    const halfH = decor.h_cm / 2;
    const x = Math.max(halfW, Math.min(salleLargeurCm - halfW, e.target.x()));
    const y = Math.max(halfH, Math.min(salleHauteurCm - halfH, e.target.y()));
    e.target.x(x);
    e.target.y(y);
    dispatch({ type: 'MOVE_DECOR', id: decor.id, x, y });
  }, [dispatch, decor.id, decor.w_cm, decor.h_cm, salleLargeurCm, salleHauteurCm]);

  const handleClick = useCallback(() => {
    dispatch({ type: 'SELECT_DECOR', id: decor.id });
  }, [dispatch, decor.id]);

  const setCursor = (e: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = cursor;
  };

  return (
    <Group
      x={decor.pos_x}
      y={decor.pos_y}
      rotation={decor.rot}
      draggable
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={e => setCursor(e, 'move')}
      onMouseLeave={e => setCursor(e, 'default')}
    >
      <Rect
        x={-decor.w_cm / 2}
        y={-decor.h_cm / 2}
        width={decor.w_cm}
        height={decor.h_cm}
        fill={couleurDecor(decor.type)}
        stroke={isSelected ? "#cca962" : "#a6b48c"}
        strokeWidth={isSelected ? 4 : 2}
        dash={isSelected ? undefined : [12, 8]}
        cornerRadius={6}
      />
      <Text
        text={decor.label}
        x={-decor.w_cm / 2}
        y={-8}
        width={decor.w_cm}
        align="center"
        fontSize={16}
        fontStyle="bold"
        fill="#b6a29d"
        listening={false}
      />
    </Group>
  );
}
