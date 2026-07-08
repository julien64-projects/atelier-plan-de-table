'use client';

import { useCallback } from 'react';
import { Group, Circle, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { TableOnPlan } from '@/lib/store/types';
import { etatCapacite, empreinteTournee } from '@/lib/geometry/tableGeometry';
import { positionsSiegesRonde, positionsSiegesDroite, premierSiegeLibre, type SeatPos } from '@/lib/geometry/seatGeometry';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { useGuestState, useGuestDispatch, useGuestsForTable, useSeatMap } from '@/lib/store/guestStore';

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
  const seatMap = useSeatMap(table.id);
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
  const emp = empreinteTournee(tableInput, table.rot);

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
      const seatIndex = premierSiegeLibre(Object.keys(seatMap).map(Number));
      const warning = seatIndex >= etat.max
        ? `${table.nom} est pleine (max ${etat.max}) — invité placé en dépassement.`
        : null;
      guestDispatch({ type: 'ASSIGN_GUEST', guestId: placementMode.guestId, tableId: table.id, seatIndex, warning });
    } else {
      dispatch({ type: 'SELECT_TABLE', id: table.id });
    }
  }, [dispatch, guestDispatch, table.id, table.nom, placementMode, seatMap, etat.max]);

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

  // Positions des sièges (autant que la capacité max), remplis dans l'ordre d'assignation
  const seats: SeatPos[] = table.shape === 'ronde'
    ? positionsSiegesRonde(table.diametreCm ?? 150, etat.max)
    : positionsSiegesDroite(table.longueurCm ?? 180, etat.max, { largeurCm: table.largeurCm, bouts: table.bouts });

  const placing = placementMode.active && placementMode.guestId;

  const seatNodes = seats.map(seat => {
    const g = seatMap[seat.index];
    const occupied = !!g;
    const lx = seat.x + Math.cos(seat.angle) * 15;
    const ly = seat.y + Math.sin(seat.angle) * 15;
    const onSeatClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (placing && placementMode.guestId) {
        e.cancelBubble = true;
        guestDispatch({ type: 'ASSIGN_GUEST', guestId: placementMode.guestId, tableId: table.id, seatIndex: seat.index, warning: null });
      }
    };
    return (
      <Group key={seat.index} listening={!!placing} onClick={onSeatClick} onTap={onSeatClick}>
        <Circle
          x={seat.x}
          y={seat.y}
          radius={11}
          fill={occupied ? '#d9c7a8' : '#f3eee4'}
          stroke={placing ? '#2563eb' : occupied && g.aConfirmer ? '#b45309' : '#b0a48f'}
          strokeWidth={placing ? 2 : occupied && g.aConfirmer ? 2 : 1}
        />
        {occupied && (
          <Text
            text={`${g.marie ? '💍 ' : ''}${truncate(g.nom, 10)}`}
            x={lx - 34}
            y={ly - 4}
            width={68}
            align="center"
            fontSize={9}
            fontStyle={g.aConfirmer ? 'italic' : 'normal'}
            fill={g.aConfirmer ? '#b45309' : '#555'}
          />
        )}
      </Group>
    );
  });

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
        {/* Sièges */}
        {seatNodes}
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
      {/* Sièges */}
      {seatNodes}
    </Group>
  );
}
