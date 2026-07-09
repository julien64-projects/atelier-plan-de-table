'use client';

import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { useGuestsForTable, useGuestDispatch } from '@/lib/store/guestStore';
import { etatCapacite } from '@/lib/geometry/tableGeometry';
import type { NiveauConfort } from '@/lib/types';

const BADGE_LABELS: Record<string, string> = {
  ok: 'OK',
  plein: 'Plein',
  depassement: 'Dépassement',
};

const BADGE_CSS: Record<string, string> = {
  ok: 'bg-sage/15 text-sage',
  plein: 'bg-amber-500/15 text-amber-300',
  depassement: 'bg-red-500/15 text-red-300',
};

const CONFORTS: { value: NiveauConfort; label: string }[] = [
  { value: 'serré', label: 'Serré' },
  { value: 'standard', label: 'Standard' },
  { value: 'généreux', label: 'Généreux' },
];

export default function TableInspector() {
  const { tables, selectedTableId } = useRoomState();
  const dispatch = useRoomDispatch();
  const guestDispatch = useGuestDispatch();

  const table = tables.find(t => t.id === selectedTableId);
  const assignedGuests = useGuestsForTable(selectedTableId ?? '');
  if (!table) return null;

  const tableInput = {
    shape: table.shape,
    diametreCm: table.diametreCm,
    longueurCm: table.longueurCm,
    largeurCm: table.largeurCm,
    confort: table.confort,
    bouts: table.bouts,
  };
  const etat = etatCapacite(tableInput, assignedGuests.length);

  const shapeLabel = table.shape === 'ronde' ? 'Ronde' : table.shape === 'rect' ? 'Rectangulaire' : 'Banquet';
  const estRonde = table.shape === 'ronde';

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-ink">Table sélectionnée</h2>

      {/* Nom */}
      <div>
        <label className="text-sm text-muted">Nom</label>
        <input
          type="text"
          value={table.nom}
          onChange={e => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { nom: e.target.value } })}
          className="mt-1 w-full px-2 py-1 text-sm border border-line rounded"
        />
      </div>

      {/* Forme */}
      <p className="text-sm text-muted"><span className="font-medium">Forme :</span> {shapeLabel}</p>

      {/* Taille */}
      <div>
        <label className="text-sm text-muted">
          {estRonde ? 'Diamètre (cm)' : 'Longueur (cm)'}
        </label>
        <input
          type="number"
          min={80}
          max={estRonde ? 300 : 600}
          step={5}
          value={estRonde ? (table.diametreCm ?? 150) : (table.longueurCm ?? 180)}
          onChange={e => {
            const v = Math.max(80, Number(e.target.value) || 0);
            dispatch({
              type: 'UPDATE_TABLE',
              id: table.id,
              changes: estRonde ? { diametreCm: v } : { longueurCm: v },
            });
          }}
          className="mt-1 w-full px-2 py-1 text-sm border border-line rounded"
        />
      </div>

      {/* Chaises en bout (tables droites) */}
      {!estRonde && (
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={table.bouts}
            onChange={e => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { bouts: e.target.checked } })}
          />
          Chaises en bout de table
        </label>
      )}

      {/* Rotation (tables droites) */}
      {!estRonde && (
        <div>
          <label className="text-sm text-muted">Rotation</label>
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { rot: (table.rot + 90) % 360 } })}
              className="px-3 py-1 text-sm border border-line rounded hover:bg-cream"
            >
              Pivoter 90°
            </button>
            {table.rot !== 0 && (
              <button
                onClick={() => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { rot: 0 } })}
                className="px-2 py-1 text-xs text-muted hover:text-ink"
              >
                Réinitialiser
              </button>
            )}
            <span className="text-sm text-muted ml-auto">{table.rot}°</span>
          </div>
        </div>
      )}

      {/* Confort */}
      <div>
        <label className="text-sm text-muted">Confort</label>
        <div className="mt-1 flex gap-1">
          {CONFORTS.map(c => (
            <button
              key={c.value}
              onClick={() => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { confort: c.value } })}
              className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                table.confort === c.value
                  ? 'bg-terracotta text-white border-terracotta'
                  : 'bg-cream text-muted border-line hover:bg-cream'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Capacité */}
      <div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${BADGE_CSS[etat.niveau]}`}>
            {etat.assis}/{etat.max} — {BADGE_LABELS[etat.niveau]}
          </span>
        </div>
        {etat.niveau === 'depassement' && (
          <p className="mt-1 text-xs text-red-400">
            {etat.depassement} invité{etat.depassement > 1 ? 's' : ''} au-delà de la capacité — agrandir la table ou en déplacer.
          </p>
        )}
      </div>

      {/* Invités assignés */}
      {assignedGuests.length > 0 && (
        <div>
          <h3 className="text-sm text-muted mb-1">Invités ({assignedGuests.length})</h3>
          <ul className="space-y-1">
            {assignedGuests.map(g => (
              <li key={g.id} className="flex items-center justify-between px-2 py-1 text-sm bg-cream rounded">
                <span>{g.nom}</span>
                <button
                  onClick={() => guestDispatch({ type: 'UNASSIGN_GUEST', guestId: g.id })}
                  className="text-faint hover:text-red-400 text-xs"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Supprimer */}
      <button
        onClick={() => dispatch({ type: 'REMOVE_TABLE', id: table.id })}
        className="w-full mt-2 px-3 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/100/10 transition-colors"
      >
        Supprimer cette table
      </button>
    </div>
  );
}
