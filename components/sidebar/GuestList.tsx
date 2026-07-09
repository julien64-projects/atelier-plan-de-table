'use client';

import { useState } from 'react';
import { useGuestState, useGuestDispatch, useUnassignedGuests, type GuestOnPlan } from '@/lib/store/guestStore';
import { useRoomState } from '@/lib/store/roomStore';

export default function GuestList() {
  const { guests, assignments, placementMode, warning } = useGuestState();
  const dispatch = useGuestDispatch();
  const { tables } = useRoomState();
  const unassigned = useUnassignedGuests();
  const [nom, setNom] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState('');

  const handleAdd = () => {
    const trimmed = nom.trim();
    if (!trimmed) return;
    dispatch({ type: 'ADD_GUEST', nom: trimmed });
    setNom('');
  };

  const handleBulk = () => {
    const noms = bulk.split('\n').map(l => l.trim()).filter(Boolean);
    if (noms.length === 0) return;
    dispatch({ type: 'ADD_GUESTS', noms });
    setBulk('');
    setBulkOpen(false);
  };

  const tableNom = (guestId: string) => {
    const a = assignments[guestId];
    if (!a) return null;
    return tables.find(t => t.id === a.tableId)?.nom ?? '?';
  };

  const assigned = guests.filter(g => assignments[g.id]);
  const nbAConfirmer = guests.filter(g => g.aConfirmer).length;
  const nbMaries = guests.filter(g => g.marie).length;

  const renderGuest = (g: GuestOnPlan, place: boolean) => {
    const isEditing = editingId === g.id;
    return (
      <li key={g.id} className="rounded hover:bg-cream">
        <div className="flex items-center justify-between px-2 py-1 text-sm">
          <div className="flex items-center gap-1.5 min-w-0">
            {g.marie && <span title="Marié·e">💍</span>}
            <span className={`truncate ${place ? 'text-ink' : 'text-muted italic'}`}>{g.nom}</span>
            {g.aConfirmer && (
              <span className="px-1 py-0.5 text-[10px] rounded bg-amber-500/15 text-amber-300 whitespace-nowrap">à confirmer</span>
            )}
            {g.menu && (
              <span className="px-1 py-0.5 text-[10px] rounded bg-cream text-muted whitespace-nowrap">{g.menu}</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {place && <span className="text-xs text-faint">{tableNom(g.id)}</span>}
            <button
              onClick={() => setEditingId(isEditing ? null : g.id)}
              className={`px-1.5 py-0.5 text-xs rounded ${isEditing ? 'bg-line text-ink' : 'text-faint hover:bg-line'}`}
              title="Modifier"
            >
              ✎
            </button>
            {place ? (
              <button
                onClick={() => dispatch({ type: 'UNASSIGN_GUEST', guestId: g.id })}
                className="px-2 py-0.5 text-xs rounded bg-cream text-muted hover:bg-line"
              >
                Retirer
              </button>
            ) : (
              <button
                onClick={() => dispatch({ type: 'START_PLACEMENT', guestId: g.id })}
                className={`px-2 py-0.5 text-xs rounded ${
                  placementMode.guestId === g.id ? 'bg-terracotta text-white' : 'bg-cream text-muted hover:bg-line'
                }`}
              >
                Placer
              </button>
            )}
            <button
              onClick={() => dispatch({ type: 'REMOVE_GUEST', id: g.id })}
              className="text-faint hover:text-red-400 text-xs"
            >
              ×
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="px-2 pb-2 space-y-2">
            <input
              type="text"
              value={g.menu ?? ''}
              onChange={e => dispatch({ type: 'UPDATE_GUEST', id: g.id, changes: { menu: e.target.value || undefined } })}
              placeholder="Menu (ex : Végétarien, Enfant…)"
              className="w-full px-2 py-1 text-xs border border-line rounded"
            />
            <div className="flex gap-3 text-xs text-muted">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={!!g.marie}
                  onChange={e => dispatch({ type: 'UPDATE_GUEST', id: g.id, changes: { marie: e.target.checked } })}
                />
                Marié·e
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={!!g.aConfirmer}
                  onChange={e => dispatch({ type: 'UPDATE_GUEST', id: g.id, changes: { aConfirmer: e.target.checked } })}
                />
                À confirmer
              </label>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-ink">Invités ({guests.length})</h2>
        <span className="text-xs text-faint">
          {nbMaries > 0 && `${nbMaries} marié·e${nbMaries > 1 ? 's' : ''}`}
          {nbMaries > 0 && nbAConfirmer > 0 && ' · '}
          {nbAConfirmer > 0 && `${nbAConfirmer} à confirmer`}
        </span>
      </div>

      {/* Ajout */}
      <div className="flex gap-2">
        <input
          type="text"
          value={nom}
          onChange={e => setNom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Nom de l'invité"
          className="flex-1 px-2 py-1 text-sm border border-line rounded"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1 text-sm bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors"
        >
          Ajouter
        </button>
      </div>

      {/* Import en masse */}
      <div>
        <button
          onClick={() => setBulkOpen(o => !o)}
          className="text-xs text-muted hover:text-ink underline"
        >
          {bulkOpen ? 'Fermer' : 'Coller une liste'}
        </button>
        {bulkOpen && (
          <div className="mt-1 space-y-1">
            <textarea
              value={bulk}
              onChange={e => setBulk(e.target.value)}
              placeholder="Un nom par ligne"
              rows={4}
              className="w-full px-2 py-1 text-sm border border-line rounded"
            />
            <button
              onClick={handleBulk}
              className="w-full px-3 py-1 text-sm bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors"
            >
              Ajouter tout
            </button>
          </div>
        )}
      </div>

      {/* Avertissement de dépassement */}
      {warning && (
        <div className="flex items-center justify-between px-2 py-1.5 bg-amber-500/10 border border-amber-500/40 rounded text-sm text-amber-200">
          <span>{warning}</span>
          <button onClick={() => dispatch({ type: 'DISMISS_WARNING' })} className="text-amber-300 hover:text-amber-100 font-medium ml-2">
            ×
          </button>
        </div>
      )}

      {/* Mode placement actif */}
      {placementMode.active && (
        <div className="flex items-center justify-between px-2 py-1.5 bg-terracotta/15 border border-terracotta/40 rounded text-sm text-blush">
          <span>Cliquez sur une table pour placer l'invité</span>
          <button onClick={() => dispatch({ type: 'CANCEL_PLACEMENT' })} className="text-blush hover:text-white font-medium">
            Annuler
          </button>
        </div>
      )}

      {/* Non placés */}
      {unassigned.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-faint uppercase tracking-wide mb-1">Non placés ({unassigned.length})</h3>
          <ul className="space-y-0.5">{unassigned.map(g => renderGuest(g, false))}</ul>
        </div>
      )}

      {/* Placés */}
      {assigned.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-faint uppercase tracking-wide mb-1">Placés ({assigned.length})</h3>
          <ul className="space-y-0.5">{assigned.map(g => renderGuest(g, true))}</ul>
        </div>
      )}
    </div>
  );
}
