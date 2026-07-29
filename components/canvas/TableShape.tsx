'use client';

import { useCallback } from 'react';
import { Group, Circle, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { TableOnPlan } from '@/lib/store/types';
import { etatCapacite, empreinteTournee } from '@/lib/geometry/tableGeometry';
import { positionsSiegesRonde, positionsSiegesDroite, premierSiegeLibre, type SeatPos } from '@/lib/geometry/seatGeometry';
import { siegeLePlusProche } from '@/lib/geometry/seatPicking';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { useGuestState, useGuestDispatch, useGuestsForTable, useSeatMap } from '@/lib/store/guestStore';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface TableShapeProps {
  table: TableOnPlan;
  onHover?: (id: string | null) => void;
}

export default function TableShape({ table, onHover }: TableShapeProps) {
  const { salleLargeurCm, salleHauteurCm, selectedTableId, tables } = useRoomState();
  const dispatch = useRoomDispatch();
  const { placementMode, dragMode } = useGuestState();
  const { canvas } = useTheme();

  const TABLE_FILL = canvas.tableFill;
  const TABLE_STROKE = canvas.tableStroke;
  const SELECT_STROKE = canvas.selectStroke;
  const BADGE_COLORS = { ok: canvas.badgeOk, plein: canvas.badgePlein, depassement: canvas.badgeDepass };
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

  const strokeColor = isSelected ? SELECT_STROKE : TABLE_STROKE;
  const strokeW = isSelected ? 3.5 : 1.5;

  const truncate = (s: string, max: number) => s.length > max ? s.slice(0, max - 1) + '…' : s;

  // Positions des sièges (autant que la capacité max), remplis dans l'ordre d'assignation
  const seats: SeatPos[] = table.shape === 'ronde'
    ? positionsSiegesRonde(table.diametreCm ?? 150, etat.max)
    : positionsSiegesDroite(table.longueurCm ?? 180, etat.max, { largeurCm: table.largeurCm, bouts: table.bouts });

  const placing = placementMode.active && placementMode.guestId;

  // Rotation appliquée aux positions de sièges (les libellés restent droits)
  const rotRad = ((table.rot ?? 0) * Math.PI) / 180;
  const cosR = Math.cos(rotRad);
  const sinR = Math.sin(rotRad);

  const seatNodes = seats.map(seat => {
    const g = seatMap[seat.index];
    const occupied = !!g;
    const sx = seat.x * cosR - seat.y * sinR;
    const sy = seat.x * sinR + seat.y * cosR;
    // Étiquette : oblique à angle UNIFORME (-45°) pour toutes, décalée hors du
    // point (au-dessus pour la rangée du haut, en-dessous pour celle du bas ;
    // radialement pour les rondes). Décalage LOCAL au groupe-siège.
    const LABEL_OFFSET = 28;
    const LABEL_W = 96;
    const LABEL_ANGLE = -45; // degrés, identique pour tous les noms
    let ox: number, oy: number;
    if (table.shape === 'ronde') {
      ox = Math.cos(seat.angle) * LABEL_OFFSET;
      oy = Math.sin(seat.angle) * LABEL_OFFSET;
    } else {
      oy = seat.y < 0 ? -LABEL_OFFSET : seat.y > 0 ? LABEL_OFFSET : 0;
      ox = seat.y === 0 ? Math.sign(seat.x) * LABEL_OFFSET : 0;
    }
    const llx = ox * cosR - oy * sinR;
    const lly = ox * sinR + oy * cosR;

    const draggable = !!dragMode && occupied;

    const onSeatClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (placing && placementMode.guestId) {
        e.cancelBubble = true;
        guestDispatch({ type: 'ASSIGN_GUEST', guestId: placementMode.guestId, tableId: table.id, seatIndex: seat.index, warning: null });
      }
    };

    const onSeatDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true; // ne pas déclencher le drag de la table
    };
    const onSeatDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      const stage = e.target.getStage();
      const abs = e.target.absolutePosition();
      let roomX = abs.x;
      let roomY = abs.y;
      if (stage) {
        roomX = (abs.x - stage.x()) / stage.scaleX();
        roomY = (abs.y - stage.y()) / stage.scaleY();
      }
      const cible = siegeLePlusProche(tables, roomX, roomY);
      if (cible && g) {
        guestDispatch({ type: 'MOVE_GUEST_TO_SEAT', guestId: g.id, tableId: cible.tableId, seatIndex: cible.seatIndex });
      }
      // Revenir à la place d'origine ; le re-render finalisera selon l'état.
      e.target.position({ x: sx, y: sy });
    };
    const onSeatEnter = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!draggable) return;
      const c = e.target.getStage()?.container();
      if (c) c.style.cursor = 'grab';
    };

    return (
      <Group
        key={seat.index}
        x={sx}
        y={sy}
        draggable={draggable}
        listening={!!placing || draggable}
        onClick={onSeatClick}
        onTap={onSeatClick}
        onDragStart={onSeatDragStart}
        onDragEnd={onSeatDragEnd}
        onMouseEnter={onSeatEnter}
      >
        <Circle
          x={0}
          y={0}
          radius={draggable ? 12 : 11}
          fill={occupied ? canvas.seatOccupied : canvas.seatEmpty}
          stroke={placing || draggable ? SELECT_STROKE : occupied && g.aConfirmer ? canvas.seatLabelAccent : canvas.seatStroke}
          strokeWidth={placing || draggable ? 2 : occupied && g.aConfirmer ? 2 : 1}
        />
        {occupied && (
          <Group x={llx} y={lly} rotation={LABEL_ANGLE} listening={false}>
            <Text
              text={`${g.marie ? '💍 ' : ''}${g.menu && /vég|vege/i.test(g.menu) ? '🥗 ' : ''}${truncate(g.nom, 14)}`}
              x={-LABEL_W / 2}
              y={-7}
              width={LABEL_W}
              align="center"
              fontSize={13}
              fontStyle={g.aConfirmer ? 'italic' : 'bold'}
              fill={g.aConfirmer ? canvas.seatLabelAccent : canvas.seatLabel}
            />
          </Group>
        )}
      </Group>
    );
  });

  const groupProps = {
    x: table.pos_x,
    y: table.pos_y,
    draggable: !table.verrou && !dragMode,
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
        <Circle radius={r} fill={TABLE_FILL} stroke={strokeColor} strokeWidth={strokeW} />
        <Text
          text={table.nom}
          x={-r}
          y={-10}
          width={r * 2}
          align="center"
          fontSize={14}
          fontStyle="bold"
          fill="#f2e7e0"
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
        {table.verrou && (
          <Text text="🔒" x={-r * 0.7 - 14} y={-r * 0.7 - 8} fontSize={14} listening={false} />
        )}
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
      <Group rotation={table.rot}>
        <Rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          fill={TABLE_FILL}
          stroke={strokeColor}
          strokeWidth={strokeW}
          cornerRadius={4}
        />
      </Group>
      <Text
        text={table.nom}
        x={-w / 2}
        y={-10}
        width={w}
        align="center"
        fontSize={14}
        fontStyle="bold"
        fill={canvas.tableText}
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
      {table.verrou && (
        <Text text="🔒" x={-w / 2 - 6} y={-h / 2 - 8} fontSize={14} listening={false} />
      )}
      {/* Sièges */}
      {seatNodes}
    </Group>
  );
}
