'use client';

import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  hint?: string;      // aperçu affiché quand la section est repliée
  locked?: boolean;   // marque « paramétré » (indicatif, l'édition reste possible)
  children: ReactNode;
}

export default function Section({ title, open, onToggle, hint, locked, children }: SectionProps) {
  return (
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-5 py-3 text-left group"
      >
        <span className="text-gold/70 text-xs w-3">{open ? '▾' : '▸'}</span>
        <span className="text-lg text-ink">{title}</span>
        {locked && <span className="text-[11px]" title="Paramétré par le planner">🔒</span>}
        {!open && hint && <span className="ml-auto text-xs text-faint truncate max-w-[45%]">{hint}</span>}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}
