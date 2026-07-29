'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import type Konva from 'konva';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { useGuestDispatch } from '@/lib/store/guestStore';
import { siegeLePlusProche } from '@/lib/geometry/seatPicking';
import Grid from './Grid';
import RoomBorder from './RoomBorder';
import PlanObjectsLayer from './PlanObjectsLayer';
import DistanceLinesLayer from './DistanceLinesLayer';
import WallDistanceLayer from './WallDistanceLayer';
import TableDimensionsLayer from './TableDimensionsLayer';
import { planEnPNG, planEnPDF, telecharger } from '@/lib/export/exportPlan';

const MIN_SCALE = 0.1;
const MAX_SCALE = 3;
const PADDING = 60; // px de marge autour de la salle au chargement

export default function RoomCanvas() {
  const { salleLargeurCm, salleHauteurCm, tables } = useRoomState();
  const dispatch = useRoomDispatch();
  const guestDispatch = useGuestDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [showTechnique, setShowTechnique] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exporter = useCallback(async (format: 'png' | 'pdf') => {
    const stage = stageRef.current;
    if (!stage) return;
    setExporting(true);
    setExportOpen(false);
    // Masquer la grille technique le temps de la capture (plan « propre »).
    const techniqueAvant = showTechnique;
    if (techniqueAvant) setShowTechnique(false);
    try {
      // Laisse React retirer les calques techniques avant la capture.
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const png = planEnPNG(stage, salleLargeurCm, salleHauteurCm);
      if (format === 'png') {
        telecharger(png, 'plan-de-table.png');
      } else {
        await planEnPDF(png, salleLargeurCm, salleHauteurCm);
      }
    } catch (e) {
      console.error('[export] échec', e);
    } finally {
      if (techniqueAvant) setShowTechnique(true);
      setExporting(false);
    }
  }, [salleLargeurCm, salleHauteurCm, showTechnique]);

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

  // Dépôt d'un invité glissé depuis la liste (HTML5 DnD) sur une chaise du plan.
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (Array.from(e.dataTransfer.types).includes('application/x-guest-id')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    const guestId = e.dataTransfer.getData('application/x-guest-id');
    if (!guestId) return;
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const roomX = (e.clientX - rect.left - position.x) / scale;
    const roomY = (e.clientY - rect.top - position.y) / scale;
    const cible = siegeLePlusProche(tables, roomX, roomY);
    if (cible) {
      guestDispatch({ type: 'MOVE_GUEST_TO_SEAT', guestId, tableId: cible.tableId, seatIndex: cible.seatIndex });
    }
  }, [tables, position.x, position.y, scale, guestDispatch]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-[#171114] overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Export du plan */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(o => !o)}
            disabled={exporting}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] uppercase tracking-[0.18em] bg-surface/90 text-muted border-line hover:text-ink transition-colors disabled:opacity-60"
            title="Télécharger le plan (image ou PDF)"
          >
            {exporting ? 'Export…' : 'Exporter'}
          </button>
          {exportOpen && !exporting && (
            <div className="absolute top-full right-0 mt-1.5 w-40 rounded-lg border border-line bg-surface shadow-xl overflow-hidden">
              <button
                onClick={() => exporter('pdf')}
                className="w-full px-3.5 py-2 text-left text-xs text-muted hover:bg-cream hover:text-ink transition-colors"
              >
                PDF (impression)
              </button>
              <button
                onClick={() => exporter('png')}
                className="w-full px-3.5 py-2 text-left text-xs text-muted hover:bg-cream hover:text-ink transition-colors border-t border-line"
              >
                Image PNG
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowTechnique(v => !v)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] uppercase tracking-[0.18em] transition-colors ${
            showTechnique
              ? 'bg-terracotta text-white border-terracotta shadow-sm'
              : 'bg-surface/90 text-muted border-line hover:text-ink'
          }`}
          title="Afficher la grille et les distances"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${showTechnique ? 'bg-white' : 'bg-faint'}`} />
          Plan technique
        </button>
      </div>
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
        {showTechnique && <TableDimensionsLayer />}
        {showTechnique && <DistanceLinesLayer hoveredTableId={hoveredTableId} />}
        {showTechnique && <WallDistanceLayer />}
      </Stage>
    </div>
  );
}
