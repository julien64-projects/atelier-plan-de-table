'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import type Konva from 'konva';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import Grid from './Grid';
import RoomBorder from './RoomBorder';
import PlanObjectsLayer from './PlanObjectsLayer';
import DistanceLinesLayer from './DistanceLinesLayer';
import WallDistanceLayer from './WallDistanceLayer';

const MIN_SCALE = 0.1;
const MAX_SCALE = 3;
const PADDING = 60; // px de marge autour de la salle au chargement

export default function RoomCanvas() {
  const { salleLargeurCm, salleHauteurCm } = useRoomState();
  const dispatch = useRoomDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [showTechnique, setShowTechnique] = useState(false);

  // Adapter la taille du Stage au conteneur
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const { clientWidth, clientHeight } = container;
      setDimensions({ width: clientWidth, height: clientHeight });

      // Ajuster le zoom pour que la salle tienne dans le viewport
      const scaleX = (clientWidth - 2 * PADDING) / salleLargeurCm;
      const scaleY = (clientHeight - 2 * PADDING) / salleHauteurCm;
      const fitScale = Math.min(scaleX, scaleY);
      setScale(fitScale);
      setPosition({
        x: (clientWidth - salleLargeurCm * fitScale) / 2,
        y: (clientHeight - salleHauteurCm * fitScale) / 2,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [salleLargeurCm, salleHauteurCm]);

  // Zoom à la molette (centré sur le curseur)
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const factor = 1.08;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, direction > 0 ? oldScale * factor : oldScale / factor));

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, []);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    // Pan du stage
    if (e.target === stageRef.current) {
      setPosition({ x: e.target.x(), y: e.target.y() });
    }
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 bg-[#171114] overflow-hidden">
      <button
        onClick={() => setShowTechnique(v => !v)}
        className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] uppercase tracking-[0.18em] transition-colors ${
          showTechnique
            ? 'bg-terracotta text-white border-terracotta shadow-sm'
            : 'bg-surface/90 text-muted border-line hover:text-ink'
        }`}
        title="Afficher la grille et les distances"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${showTechnique ? 'bg-white' : 'bg-faint'}`} />
        Plan technique
      </button>
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onClick={(e) => { if (e.target === stageRef.current) dispatch({ type: 'SELECT_TABLE', id: null }); }}
        onTap={(e) => { if (e.target === stageRef.current) dispatch({ type: 'SELECT_TABLE', id: null }); }}
      >
        <Layer>
          <RoomBorder largeurCm={salleLargeurCm} hauteurCm={salleHauteurCm} />
          {showTechnique && <Grid largeurCm={salleLargeurCm} hauteurCm={salleHauteurCm} />}
        </Layer>
        <PlanObjectsLayer onHover={setHoveredTableId} />
        {showTechnique && <DistanceLinesLayer hoveredTableId={hoveredTableId} />}
        {showTechnique && <WallDistanceLayer />}
      </Stage>
    </div>
  );
}
