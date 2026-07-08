'use client';

import { useCallback } from 'react';
import { Group, Circle, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { TableOnPlan } from '@/lib/store/types';
import { etatCapacite, empreinte } from '@/lib/geometry/tableGeometry';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { useGuestState, useGuestDispatch, useGuestsForTable } from '@/lib/store/guestStore';

const BADGE_COLORS = {
  ok: '#22c55e',
  plein: '#f59e0b',
  depassement: '#ef4444',
} as const;

interface TableShapeProps {
  table: TableOnPlan;
  onHover?: (id: string | null) => void;
}

export default function TableShape({ table, onHover }: TableShapeProps) {
  const { salleLargeurCm, salleHauteurCm, selectedTableId } = useRoomState();
  const dispatch = useRoomDispatch();
  const { placementMode } = useGuestState();
  const guestDispatch = useGuestDispatch();
  const assignedGuests = useGuestsForTable(table.id);
  const nbAssis = assignedGuests.length;
  const isSelected = selectedTableId === table.id;

  const tableInput = {
    shape: table.shape,
    diametreCm: table.diametreCm,
    longueurCm: table.longueurCm,
    largeurCm: table.largeurCm,
    confort: table.confort,
    bouts: table.bouts,
  };
  const etat = etatCapacite(tableInput, nbAssis);
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
    if (placementMode.active && placementMode.guestId) {
      guestDispatch({ type: 'ASSIGN_GUEST', guestId: placementMode.guestId, tableId: table.id });
    } else {
      dispatch({ type: 'SELECT_TABLE', id: table.id });
    }
  }, [dispatch, guestDispatch, table.id, placementMode]);

  const handleMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = placementMode.active ? 'crosshair' : 'pointer';
    onHover?.(table.id);
  }, [onHover, table.id, placementMode.active]);

  const handleMouseLeave = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = 'default';
    onHover?.(null);
  }, [onHover]);

  const strokeColor = isSelected ? '#2563eb' : '#8b7355';
  const strokeW = isSelected ? 4 : 2;

  const truncate = (s: string, max: number) => s.length > max ? s.slice(0, max - 1) + '…' : s;

  const groupProps = {
    x: table.pos_x,
    y: table.pos_y,
    draggable: true,
    onDragEnd: handleDragEnd,
    onClick: handleClick,
    onTap: handleClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };

  if (table.shape === 'ronde') {
    const r = (table.diametreCm ?? 150) / 2;
    const nameRadius = r + 20;
    return (
      <Group {...groupProps}>
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
        {/* Noms des invités en cercle */}
        {assignedGuests.map((g, i) => {
          const angle = (2 * Math.PI * i) / assignedGuests.length - Math.PI / 2;
          const gx = Math.cos(angle) * nameRadius;
          const gy = Math.sin(angle) * nameRadius;
          return (
            <Text
              key={g.id}
              text={truncate(g.nom, 10)}
              x={gx - 30}
              y={gy - 5}
              width={60}
              align="center"
              fontSize={10}
              fill="#555"
              listening={false}
            />
          );
        })}
      </Group>
    );
  }

  // rect / banquet
  const w = table.longueurCm ?? 180;
  const h = table.largeurCm ?? 90;
  return (
    <Group {...groupProps}>
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
      {/* Noms le long des grands côtés */}
      {assignedGuests.map((g, i) => {
        const side = i % 2 === 0 ? -1 : 1; // alterne haut/bas
        const idx = Math.floor(i / 2);
        const count = Math.ceil(assignedGuests.length / 2);
        const spacing = w / (count + 1);
        const gx = -w / 2 + spacing * (idx + 1);
        const gy = side * (h / 2 + 14);
        return (
          <Text
            key={g.id}
            text={truncate(g.nom, 10)}
            x={gx - 30}
            y={gy - 5}
            width={60}
            align="center"
            fontSize={10}
            fill="#555"
            listening={false}
          />
        );
      })}
    </Group>
  );
}
