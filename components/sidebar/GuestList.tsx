'use client';

import { useState } from 'react';
import { useGuestState, useGuestDispatch, useUnassignedGuests } from '@/lib/store/guestStore';
import { useRoomState } from '@/lib/store/roomStore';

export default function GuestList() {
  const { guests, assignments, placementMode } = useGuestState();
  const dispatch = useGuestDispatch();
  const { tables } = useRoomState();
  const unassigned = useUnassignedGuests();
  const [nom, setNom] = useState('');

  const handleAdd = () => {
    const trimmed = nom.trim();
    if (!trimmed) return;
    dispatch({ type: 'ADD_GUEST', nom: trimmed });
    setNom('');
  };

  const tableNom = (guestId: string) => {
    const tableId = assignments[guestId];
    if (!tableId) return null;
    return tables.find(t => t.id === tableId)?.nom ?? '?';
  };

  const assigned = guests.filter(g => assignments[g.id]);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-gray-700">Invités ({guests.length})</h2>

      {/* Ajout */}
      <div className="flex gap-2">
        <input
          type="text"
          value={nom}
          onChange={e => setNom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Nom de l'invité"
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Ajouter
        </button>
      </div>

      {/* Mode placement actif */}
      {placementMode.active && (
        <div className="flex items-center justify-between px-2 py-1.5 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          <span>Cliquez sur une table pour placer l'invité</span>
          <button onClick={() => dispatch({ type: 'CANCEL_PLACEMENT' })} className="text-blue-500 hover:text-blue-800 font-medium">
            Annuler
          </button>
        </div>
      )}

      {/* Non placés */}
      {unassigned.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Non placés ({unassigned.length})</h3>
          <ul className="space-y-1">
            {unassigned.map(g => (
              <li key={g.id} className="flex items-center justify-between px-2 py-1 text-sm rounded hover:bg-gray-50">
                <span className="text-gray-600 italic">{g.nom}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => dispatch({ type: 'START_PLACEMENT', guestId: g.id })}
                    className={`px-2 py-0.5 text-xs rounded ${
                      placementMode.guestId === g.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Placer
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_GUEST', id: g.id })}
                    className="text-gray-400 hover:text-red-500 text-xs"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Placés */}
      {assigned.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Placés ({assigned.length})</h3>
          <ul className="space-y-1">
            {assigned.map(g => (
              <li key={g.id} className="flex items-center justify-between px-2 py-1 text-sm rounded hover:bg-gray-50">
                <span className="text-gray-800">{g.nom}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{tableNom(g.id)}</span>
                  <button
                    onClick={() => dispatch({ type: 'UNASSIGN_GUEST', guestId: g.id })}
                    className="text-gray-400 hover:text-red-500 text-xs"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
