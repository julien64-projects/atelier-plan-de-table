'use client';

import { useState } from 'react';
import { useGuestState, useGuestDispatch, useUnassignedGuests, type GuestOnPlan } from '@/lib/store/guestStore';
import { useRoomState } from '@/lib/store/roomStore';
import { CATEGORIES, RANGS, EVENEMENTS, type EvenementKey } from '@/lib/guests';
import { useT } from '@/lib/i18n/LangProvider';
import RecapModal from './RecapModal';

export default function GuestList() {
  const { guests, assignments, placementMode, warning, dragMode } = useGuestState();
  const dispatch = useGuestDispatch();
  const { tables } = useRoomState();
  const unassigned = useUnassignedGuests();
  const t = useT();
  const [nom, setNom] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState('');
  const [recapOpen, setRecapOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [eventFilters, setEventFilters] = useState<EvenementKey[]>([]);

  const toggleEvent = (k: EvenementKey) =>
    setEventFilters(f => (f.includes(k) ? f.filter(x => x !== k) : [...f, k]));

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

  const q = search.trim().toLowerCase();
  const keep = (g: GuestOnPlan) =>
    (!q || g.nom.toLowerCase().includes(q)) &&
    eventFilters.every(ev => !!g.evenements?.[ev]);
  const unassignedF = unassigned.filter(keep);
  const assignedF = assigned.filter(keep);
  const filtreActif = q.length > 0 || eventFilters.length > 0;
  const aucunResultat = filtreActif && unassignedF.length === 0 && assignedF.length === 0;

  const renderGuest = (g: GuestOnPlan, place: boolean) => {
    const isEditing = editingId === g.id;
    return (
      <li
        key={g.id}
        draggable={dragMode}
        onDragStart={dragMode ? (e) => {
          e.dataTransfer.setData('application/x-guest-id', g.id);
          e.dataTransfer.effectAllowed = 'move';
        } : undefined}
        className={`rounded hover:bg-cream ${dragMode ? 'cursor-grab active:cursor-grabbing ring-1 ring-gold/25' : ''}`}
      >
        <div className="flex items-center justify-between px-2 py-1 text-sm">
          <div className="flex items-center gap-1.5 min-w-0">
            {g.marie && <span title="Marié·e">💍</span>}
            <span className={`truncate ${place ? 'text-ink' : 'text-muted italic'}`}>{g.nom}</span>
            {g.aConfirmer && (
              <span className="px-1 py-0.5 text-[10px] rounded bg-amber-500/15 text-amber-300 whitespace-nowrap">{t('guests.toConfirm')}</span>
            )}
            {g.menu && (
              <span className="px-1 py-0.5 text-[10px] rounded bg-cream text-muted whitespace-nowrap">{g.menu}</span>
            )}
            {g.rang === 'vip' && (
              <span className="px-1 py-0.5 text-[10px] rounded bg-gold/15 text-gold whitespace-nowrap">{t('rang.vip')}</span>
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
                {t('common.remove')}
              </button>
            ) : (
              <button
                onClick={() => dispatch({ type: 'START_PLACEMENT', guestId: g.id })}
                className={`px-2 py-0.5 text-xs rounded ${
                  placementMode.guestId === g.id ? 'bg-terracotta text-white' : 'bg-cream text-muted hover:bg-line'
                }`}
              >
                {t('guests.seat')}
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
            <div>
              <p className="text-[10px] uppercase tracking-wide text-faint mb-1">{t('guests.editName')}</p>
              <input
                type="text"
                value={g.nom}
                onChange={e => dispatch({ type: 'UPDATE_GUEST', id: g.id, changes: { nom: e.target.value } })}
                placeholder={t('guests.namePlaceholder')}
                className="w-full px-2 py-1 text-sm border border-line rounded text-ink font-medium"
              />
            </div>
            <input
              type="text"
              value={g.menu ?? ''}
              onChange={e => dispatch({ type: 'UPDATE_GUEST', id: g.id, changes: { menu: e.target.value || undefined } })}
              placeholder={t('guests.menuPlaceholder')}
              className="w-full px-2 py-1 text-xs border border-line rounded"
            />
            <div className="flex gap-3 text-xs text-muted">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={!!g.marie}
                  onChange={e => dispatch({ type: 'UPDATE_GUEST', id: g.id, changes: { marie: e.target.checked } })}
                />
                {t('guests.marriedLabel')}
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={!!g.aConfirmer}
                  onChange={e => dispatch({ type: 'UPDATE_GUEST', id: g.id, changes: { aConfirmer: e.target.checked } })}
                />
                {t('guests.toConfirmLabel')}
              </label>
            </div>

            {/* Catégorie */}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-faint mb-1">{t('guests.category')}</p>
              <div className="flex gap-1">
                {CATEGORIES.map(c => (
                  <button
                    key={c.key}
                    onClick={() => dispatch({ type: 'UPDATE_GUEST', id: g.id, changes: { categorie: c.key } })}
                    className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                      (g.categorie ?? 'adulte') === c.key
                        ? 'bg-terracotta text-white border-terracotta'
                        : 'bg-cream text-muted border-line hover:bg-line'
                    }`}
                  >
                    {t('cat.' + c.key)}
                  </button>
                ))}
              </div>
            </div>

            {/* Rang */}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-faint mb-1">{t('guests.rang')}</p>
              <div className="flex gap-1">
                {RANGS.map(rg => (
                  <button
                    key={rg.key}
                    onClick={() => dispatch({ type: 'UPDATE_GUEST', id: g.id, changes: { rang: rg.key } })}
                    className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                      g.rang === rg.key
                        ? 'bg-gold/20 text-gold border-gold/50'
                        : 'bg-cream text-muted border-line hover:bg-line'
                    }`}
                  >
                    {t('rang.' + rg.key)}
                  </button>
                ))}
              </div>
            </div>

            {/* Événements */}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-faint mb-1">{t('guests.events')}</p>
              <div className="grid grid-cols-2 gap-1">
                {EVENEMENTS.map(ev => (
                  <label key={ev.key} className="flex items-center gap-1.5 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={!!g.evenements?.[ev.key]}
                      onChange={e => dispatch({
                        type: 'UPDATE_GUEST',
                        id: g.id,
                        changes: { evenements: { ...g.evenements, [ev.key]: e.target.checked } },
                      })}
                    />
                    {t('event.' + ev.key)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-ink">{t('guests.title')} ({guests.length})</h2>
        <span className="text-xs text-faint">
          {nbMaries > 0 && `${nbMaries} ${nbMaries > 1 ? t('guests.marriedPlural') : t('guests.married')}`}
          {nbMaries > 0 && nbAConfirmer > 0 && ' · '}
          {nbAConfirmer > 0 && `${nbAConfirmer} ${t('guests.toConfirm')}`}
        </span>
      </div>

      <button
        onClick={() => setRecapOpen(true)}
        className="w-full px-3 py-1.5 text-xs uppercase tracking-[0.18em] border border-line rounded text-muted hover:text-ink hover:border-gold/60 transition-colors"
      >
        {t('guests.recap')}
      </button>
      {recapOpen && <RecapModal onClose={() => setRecapOpen(false)} />}

      {/* Mode glisser-déposer (cadenas) */}
      <div>
        <button
          onClick={() => dispatch({ type: 'SET_DRAG_MODE', on: !dragMode })}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded border transition-colors ${
            dragMode
              ? 'bg-gold/15 text-gold border-gold/50'
              : 'bg-cream text-muted border-line hover:text-ink hover:border-gold/50'
          }`}
          title="Activer le glisser-déposer des invités sur le plan"
        >
          <span className="text-sm">{dragMode ? '🔓' : '🔒'}</span>
          {dragMode ? t('guests.dragOn') : t('guests.locked')}
        </button>
        {dragMode && (
          <p className="mt-1 text-[11px] text-faint italic leading-snug">{t('guests.dragHint')}</p>
        )}
      </div>

      {/* Ajout */}
      <div className="flex gap-2">
        <input
          type="text"
          value={nom}
          onChange={e => setNom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={t('guests.namePlaceholder')}
          className="flex-1 px-2 py-1 text-sm border border-line rounded"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1 text-sm bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors"
        >
          {t('common.add')}
        </button>
      </div>

      {/* Import en masse */}
      <div>
        <button
          onClick={() => setBulkOpen(o => !o)}
          className="text-xs text-muted hover:text-ink underline"
        >
          {bulkOpen ? t('common.close') : t('guests.pasteList')}
        </button>
        {bulkOpen && (
          <div className="mt-1 space-y-1">
            <textarea
              value={bulk}
              onChange={e => setBulk(e.target.value)}
              placeholder={t('guests.oneNamePerLine')}
              rows={4}
              className="w-full px-2 py-1 text-sm border border-line rounded"
            />
            <button
              onClick={handleBulk}
              className="w-full px-3 py-1 text-sm bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors"
            >
              {t('guests.addAll')}
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
          <span>{t('guests.placementHint')}</span>
          <button onClick={() => dispatch({ type: 'CANCEL_PLACEMENT' })} className="text-blush hover:text-white font-medium">
            {t('common.cancel')}
          </button>
        </div>
      )}

      {/* Recherche */}
      {guests.length > 0 && (
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('guests.search')}
            className="w-full pl-8 pr-7 py-1.5 text-sm border border-line rounded"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-ink"
              aria-label="Effacer la recherche"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Filtres par événement */}
      {guests.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {EVENEMENTS.map(ev => {
            const on = eventFilters.includes(ev.key);
            return (
              <button
                key={ev.key}
                onClick={() => toggleEvent(ev.key)}
                className={`px-2 py-0.5 text-[11px] rounded-full border transition-colors ${
                  on
                    ? 'bg-terracotta text-white border-terracotta'
                    : 'bg-cream text-muted border-line hover:text-ink hover:border-gold/50'
                }`}
                title={t('event.' + ev.key)}
              >
                {t('event.' + ev.key)}
              </button>
            );
          })}
          {eventFilters.length > 0 && (
            <button
              onClick={() => setEventFilters([])}
              className="px-2 py-0.5 text-[11px] text-faint hover:text-ink underline"
            >
              {t('guests.filtersAll')}
            </button>
          )}
        </div>
      )}

      {aucunResultat && (
        <p className="text-sm text-faint italic px-1">{t('guests.noResult')}</p>
      )}

      {/* Non placés */}
      {unassignedF.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-faint uppercase tracking-wide mb-1">{t('guests.unplaced')} ({unassignedF.length})</h3>
          <ul className="space-y-0.5">{unassignedF.map(g => renderGuest(g, false))}</ul>
        </div>
      )}

      {/* Placés */}
      {assignedF.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-faint uppercase tracking-wide mb-1">{t('guests.placed')} ({assignedF.length})</h3>
          <ul className="space-y-0.5">{assignedF.map(g => renderGuest(g, true))}</ul>
        </div>
      )}
    </div>
  );
}
