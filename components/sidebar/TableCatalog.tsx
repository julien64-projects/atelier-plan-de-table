'use client';

import { useCallback, useState } from 'react';
import { TABLES_STANDARD, dimensionnerPour } from '@/lib/geometry/tableGeometry';
import { capaciteRonde, capaciteDroite } from '@/lib/geometry/tableGeometry';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import NumberInput from '@/components/ui/NumberInput';
import type { TableOnPlan } from '@/lib/store/types';
import type { TableShape } from '@/lib/types';

export default function TableCatalog() {
  const { nextTableNumber, salleLargeurCm, salleHauteurCm } = useRoomState();
  const dispatch = useRoomDispatch();
  const [nbConvives, setNbConvives] = useState(8);
  const [formeAuto, setFormeAuto] = useState<'ronde' | 'rect'>('ronde');
  const [persoShape, setPersoShape] = useState<'ronde' | 'rect'>('ronde');
  const [persoDiam, setPersoDiam] = useState(160);
  const [persoLong, setPersoLong] = useState(220);
  const [persoLarg, setPersoLarg] = useState(90);
  const [boutsAuto, setBoutsAuto] = useState(true);   // chaises en bout (droite auto)
  const [boutsPerso, setBoutsPerso] = useState(true); // chaises en bout (droite perso)

  const addTable = useCallback((table: Omit<TableOnPlan, 'id' | 'nom' | 'pos_x' | 'pos_y' | 'rot' | 'confort' | 'bouts'> & { bouts?: boolean }) => {
    const newTable: TableOnPlan = {
      ...table,
      id: crypto.randomUUID(),
      nom: `Table ${nextTableNumber}`,
      confort: 'standard',
      bouts: table.bouts ?? false,
      pos_x: salleLargeurCm / 2,
      pos_y: salleHauteurCm / 2,
      rot: 0,
    };
    dispatch({ type: 'ADD_TABLE', table: newTable });
  }, [dispatch, nextTableNumber, salleLargeurCm, salleHauteurCm]);

  const addTablePour = useCallback((n: number, shape: TableShape, bouts?: boolean) => {
    const dim = dimensionnerPour(n, shape, 'standard', bouts);
    if (dim.shape === 'ronde') {
      addTable({ shape: 'ronde', diametreCm: dim.diametreCm });
    } else {
      addTable({ shape: dim.shape, longueurCm: dim.longueurCm, largeurCm: dim.largeurCm, bouts: dim.bouts });
    }
  }, [addTable]);

  const apercu = dimensionnerPour(
    Math.max(1, nbConvives),
    formeAuto,
    'standard',
    formeAuto === 'rect' ? boutsAuto : undefined,
  );

  return (
    <div className="space-y-4">
      {/* Auto-dimensionnement */}
      <div className="p-3 bg-cream rounded-lg space-y-2">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Pour N convives</h3>
        <div className="flex items-center gap-2">
          <NumberInput
            min={1}
            value={nbConvives}
            onChange={setNbConvives}
            aria-label="Nombre de convives"
            className="w-16 px-2 py-1 text-sm border border-line rounded"
          />
          <div className="flex gap-1">
            {(['ronde', 'rect'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFormeAuto(s)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  formeAuto === s
                    ? 'bg-terracotta text-white border-terracotta'
                    : 'bg-cream text-muted border-line hover:bg-cream'
                }`}
              >
                {s === 'ronde' ? 'Ronde' : 'Droite'}
              </button>
            ))}
          </div>
        </div>
        {formeAuto === 'rect' && (
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={boutsAuto} onChange={e => setBoutsAuto(e.target.checked)} />
            Chaises en bout de table
          </label>
        )}
        <p className="text-xs text-faint">
          {apercu.shape === 'ronde'
            ? `Ø${apercu.diametreCm} cm`
            : `${apercu.longueurCm} × ${apercu.largeurCm} cm`}
          {' — '}{apercu.capacite} places
        </p>
        <button
          onClick={() => addTablePour(nbConvives, formeAuto, formeAuto === 'rect' ? boutsAuto : undefined)}
          className="w-full px-3 py-1.5 text-sm bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors"
        >
          Créer la table
        </button>
      </div>

      {/* Taille personnalisée */}
      <div className="p-3 bg-cream rounded-lg space-y-2">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Personnalisée</h3>
        <div className="flex gap-1">
          {(['ronde', 'rect'] as const).map(s => (
            <button
              key={s}
              onClick={() => setPersoShape(s)}
              className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                persoShape === s
                  ? 'bg-terracotta text-white border-terracotta'
                  : 'bg-surface text-muted border-line hover:text-ink'
              }`}
            >
              {s === 'ronde' ? 'Ronde' : 'Droite'}
            </button>
          ))}
        </div>
        {persoShape === 'ronde' ? (
          <label className="block text-xs text-muted">
            Diamètre (cm)
            <NumberInput
              min={60} max={400} step={5} value={persoDiam}
              onChange={setPersoDiam}
              className="mt-1 w-full px-2 py-1 text-sm border border-line rounded"
            />
          </label>
        ) : (
          <div className="flex gap-2">
            <label className="flex-1 text-xs text-muted">
              Longueur
              <NumberInput
                min={60} max={800} step={5} value={persoLong}
                onChange={setPersoLong}
                className="mt-1 w-full px-2 py-1 text-sm border border-line rounded"
              />
            </label>
            <label className="flex-1 text-xs text-muted">
              Largeur
              <NumberInput
                min={60} max={300} step={5} value={persoLarg}
                onChange={setPersoLarg}
                className="mt-1 w-full px-2 py-1 text-sm border border-line rounded"
              />
            </label>
          </div>
        )}
        {persoShape === 'rect' && (
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={boutsPerso} onChange={e => setBoutsPerso(e.target.checked)} />
            Chaises en bout de table
          </label>
        )}
        <p className="text-xs text-faint">
          {persoShape === 'ronde'
            ? `${capaciteRonde(persoDiam)} places`
            : `${capaciteDroite(persoLong, { bouts: boutsPerso, largeurCm: persoLarg })} places`}
        </p>
        <button
          onClick={() => persoShape === 'ronde'
            ? addTable({ shape: 'ronde', diametreCm: persoDiam })
            : addTable({ shape: 'rect', longueurCm: persoLong, largeurCm: persoLarg, bouts: boutsPerso })}
          className="w-full px-3 py-1.5 text-sm bg-terracotta text-white rounded hover:bg-terracotta-dark transition-colors"
        >
          Créer la table
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Rondes</h3>
        <div className="space-y-1">
          {TABLES_STANDARD.ronde.map(t => (
            <button
              key={t.diametreCm}
              onClick={() => addTable({ shape: 'ronde', diametreCm: t.diametreCm })}
              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-cream transition-colors"
            >
              <span>{t.label}</span>
              <span className="text-faint">{capaciteRonde(t.diametreCm)} places</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Rectangulaires</h3>
        <div className="space-y-1">
          {TABLES_STANDARD.droite.map(t => (
            <button
              key={t.longueurCm}
              onClick={() => addTable({ shape: 'rect', longueurCm: t.longueurCm, largeurCm: t.largeurCm })}
              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-cream transition-colors"
            >
              <span>{t.label}</span>
              <span className="text-faint">{capaciteDroite(t.longueurCm)} places</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
