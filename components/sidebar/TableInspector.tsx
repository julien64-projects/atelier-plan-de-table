'use client';

import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { useGuestsForTable, useGuestDispatch, useGuestState } from '@/lib/store/guestStore';
import { etatCapacite, longueurDroitePour, diametreRondePour } from '@/lib/geometry/tableGeometry';
import { useT } from '@/lib/i18n/LangProvider';
import NumberInput from '@/components/ui/NumberInput';
import type { NiveauConfort } from '@/lib/types';

const BADGE_CSS: Record<string, string> = {
  ok: 'bg-sage/15 text-sage',
  plein: 'bg-amber-500/15 text-amber-300',
  depassement: 'bg-red-500/15 text-red-300',
};

const CONFORTS: NiveauConfort[] = ['serré', 'standard', 'généreux'];

export default function TableInspector() {
  const { tables, selectedTableId } = useRoomState();
  const dispatch = useRoomDispatch();
  const guestDispatch = useGuestDispatch();
  const { assignments } = useGuestState();
  const t = useT();

  const table = tables.find(t => t.id === selectedTableId);
  const assignedGuests = useGuestsForTable(selectedTableId ?? '');
  if (!table) return null;

  /** Retire les places vides : ramène la table à N invités et comble les trous. */
  const retirerPlacesVides = () => {
    const ordered = [...assignedGuests].sort(
      (a, b) => (assignments[a.id]?.seatIndex ?? 0) - (assignments[b.id]?.seatIndex ?? 0),
    );
    const n = ordered.length;
    if (n === 0) return;
    if (table.shape === 'ronde') {
      const d = Math.ceil(diametreRondePour(n, table.confort) / 5) * 5;
      dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { diametreCm: d } });
    } else {
      const l = longueurDroitePour(n, { confort: table.confort, bouts: table.bouts });
      dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { longueurCm: l } });
    }
    guestDispatch({ type: 'REMPLIR_TABLE', tableId: table.id, guestIdsInOrder: ordered.map(g => g.id) });
  };

  const tableInput = {
    shape: table.shape,
    diametreCm: table.diametreCm,
    longueurCm: table.longueurCm,
    largeurCm: table.largeurCm,
    confort: table.confort,
    bouts: table.bouts,
  };
  const etat = etatCapacite(tableInput, assignedGuests.length);

  const estRonde = table.shape === 'ronde';

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-ink">{t('insp.title')}</h2>

      {/* Nom */}
      <div>
        <label className="text-sm text-muted">{t('insp.name')}</label>
        <input
          type="text"
          value={table.nom}
          onChange={e => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { nom: e.target.value } })}
          className="mt-1 w-full px-2 py-1 text-sm border border-line rounded"
        />
      </div>

      {/* Forme */}
      <p className="text-sm text-muted"><span className="font-medium">{t('insp.shape')} :</span> {t('shape.' + table.shape)}</p>

      {/* Taille (personnalisable) */}
      {estRonde ? (
        <div>
          <label className="text-sm text-muted">{t('tables.diameter')}</label>
          <NumberInput
            min={60}
            max={400}
            step={5}
            value={table.diametreCm ?? 150}
            onChange={n => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { diametreCm: n } })}
            className="mt-1 w-full px-2 py-1 text-sm border border-line rounded"
          />
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-sm text-muted">{t('tables.length')} (cm)</label>
            <NumberInput
              min={60}
              max={800}
              step={5}
              value={table.longueurCm ?? 180}
              onChange={n => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { longueurCm: n } })}
              className="mt-1 w-full px-2 py-1 text-sm border border-line rounded"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted">{t('tables.width')} (cm)</label>
            <NumberInput
              min={60}
              max={300}
              step={5}
              value={table.largeurCm ?? 90}
              onChange={n => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { largeurCm: n } })}
              className="mt-1 w-full px-2 py-1 text-sm border border-line rounded"
            />
          </div>
        </div>
      )}

      {/* Chaises en bout (tables droites) */}
      {!estRonde && (
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={table.bouts}
            onChange={e => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { bouts: e.target.checked } })}
          />
          {t('tables.endChairs')}
        </label>
      )}

      {/* Rotation (tables droites) — angle libre */}
      {!estRonde && (
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted">{t('insp.rotation')}</label>
            <span className="text-sm text-muted tabular-nums">{Math.round(table.rot)}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={359}
            step={1}
            value={Math.round(table.rot) % 360}
            onChange={e => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { rot: Number(e.target.value) } })}
            className="w-full mt-1 accent-terracotta"
            aria-label="Angle de rotation"
          />
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { rot: (Math.round(table.rot) + 90) % 360 } })}
              className="px-3 py-1 text-sm border border-line rounded hover:bg-cream"
            >
              {t('insp.rotate90')}
            </button>
            {table.rot !== 0 && (
              <button
                onClick={() => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { rot: 0 } })}
                className="px-2 py-1 text-xs text-muted hover:text-ink"
              >
                {t('common.reset')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Verrou de position */}
      <button
        onClick={() => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { verrou: !table.verrou } })}
        className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded border transition-colors ${
          table.verrou
            ? 'bg-gold/15 text-gold border-gold/50'
            : 'bg-cream text-muted border-line hover:text-ink'
        }`}
      >
        {table.verrou ? t('insp.lockOn') : t('insp.lockOff')}
      </button>

      {/* Confort */}
      <div>
        <label className="text-sm text-muted">{t('insp.comfort')}</label>
        <div className="mt-1 flex gap-1">
          {CONFORTS.map(c => (
            <button
              key={c}
              onClick={() => dispatch({ type: 'UPDATE_TABLE', id: table.id, changes: { confort: c } })}
              className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                table.confort === c
                  ? 'bg-terracotta text-white border-terracotta'
                  : 'bg-cream text-muted border-line hover:bg-cream'
              }`}
            >
              {t('comfort.' + c)}
            </button>
          ))}
        </div>
      </div>

      {/* Capacité */}
      <div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${BADGE_CSS[etat.niveau]}`}>
            {etat.assis}/{etat.max} — {t('badge.' + etat.niveau)}
          </span>
        </div>
        {etat.niveau === 'depassement' && (
          <p className="mt-1 text-xs text-red-400">
            {etat.depassement} · {t('insp.overCapacity')}
          </p>
        )}
      </div>

      {/* Retirer les places vides */}
      {etat.assis > 0 && etat.assis < etat.max && (
        <button
          onClick={retirerPlacesVides}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded border border-line bg-cream text-muted hover:text-ink hover:border-gold/50 transition-colors"
          title="Réduit la table au nombre d'invités et comble les trous"
        >
          {t('insp.removePrefix')} {etat.max - etat.assis} {etat.max - etat.assis > 1 ? t('insp.emptySeats') : t('insp.emptySeat')}
        </button>
      )}

      {/* Invités assignés */}
      {assignedGuests.length > 0 && (
        <div>
          <h3 className="text-sm text-muted mb-1">{t('insp.guests')} ({assignedGuests.length})</h3>
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
        className="w-full mt-2 px-3 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
      >
        {t('insp.deleteTable')}
      </button>
    </div>
  );
}
