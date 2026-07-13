'use client';

import { useState } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  'aria-label'?: string;
}

/**
 * Champ numérique contrôlé qui tolère un état vide pendant la saisie.
 *
 * Problème résolu : un input `value={number}` avec coercition immédiate remet
 * la valeur par défaut dès qu'on efface, empêchant de retaper une valeur. Ici,
 * on garde un brouillon texte ; on ne normalise (min/max, retour à la dernière
 * valeur si vide) qu'à la sortie du champ (blur).
 */
export default function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  className,
  'aria-label': ariaLabel,
}: NumberInputProps) {
  const [draft, setDraft] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);

  // Refléter un changement externe de `value` pendant le rendu (pattern React
  // officiel, sans effet) : évite d'écraser une saisie locale en cours.
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(String(value));
  }

  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      step={step}
      aria-label={ariaLabel}
      className={className}
      value={draft}
      onChange={e => {
        const v = e.target.value;
        setDraft(v);
        if (v === '') return; // champ vide autorisé le temps de retaper
        const n = Number(v);
        if (!Number.isNaN(n)) onChange(n); // pas de clamp ici (fluide)
      }}
      onBlur={() => {
        let n = Number(draft);
        if (draft === '' || Number.isNaN(n)) n = value; // vide → dernière valeur
        if (min != null) n = Math.max(min, n);
        if (max != null) n = Math.min(max, n);
        onChange(n);
        setDraft(String(n));
      }}
    />
  );
}
