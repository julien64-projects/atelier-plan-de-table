'use client';

import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import NumberInput from '@/components/ui/NumberInput';

export default function RoomConfig() {
  const { salleLargeurCm, salleHauteurCm } = useRoomState();
  const dispatch = useRoomDispatch();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Salle</h3>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted w-16">Largeur</label>
        <NumberInput
          min={1}
          step={1}
          value={Math.round(salleLargeurCm / 100)}
          onChange={m => dispatch({ type: 'SET_ROOM_SIZE', largeurCm: m * 100, hauteurCm: salleHauteurCm })}
          aria-label="Largeur de la salle (m)"
          className="w-16 px-2 py-1 text-sm border border-line rounded"
        />
        <span className="text-sm text-faint">m</span>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted w-16">Hauteur</label>
        <NumberInput
          min={1}
          step={1}
          value={Math.round(salleHauteurCm / 100)}
          onChange={m => dispatch({ type: 'SET_ROOM_SIZE', largeurCm: salleLargeurCm, hauteurCm: m * 100 })}
          aria-label="Hauteur de la salle (m)"
          className="w-16 px-2 py-1 text-sm border border-line rounded"
        />
        <span className="text-sm text-faint">m</span>
      </div>
    </div>
  );
}
