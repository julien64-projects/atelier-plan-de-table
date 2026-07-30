'use client';

import { createPortal } from 'react-dom';
import { useGuestState } from '@/lib/store/guestStore';
import { recapInvites, CATEGORIES, RANGS, EVENEMENTS } from '@/lib/guests';
import { useT } from '@/lib/i18n/LangProvider';

function Stat({ label, value, big = false }: { label: string; value: number; big?: boolean }) {
  return (
    <div className={`rounded-lg border border-line px-3 py-3 ${big ? 'bg-terracotta/15' : 'bg-cream'}`}>
      <div className={`tabular-nums leading-none ${big ? 'text-3xl text-blush' : 'text-2xl text-ink'}`}>{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

export default function RecapModal({ onClose }: { onClose: () => void }) {
  const { guests } = useGuestState();
  const r = recapInvites(guests);
  const t = useT();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[86vh] overflow-y-auto bg-surface border border-line rounded-xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-line flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-blush font-semibold">{t('recap.eyebrow')}</p>
            <h2 className="text-2xl text-ink mt-0.5">{t('recap.title')}</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink text-2xl leading-none" aria-label={t('common.close')}>×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Totaux */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label={t('recap.totalGuests')} value={r.total} big />
            {CATEGORIES.map(c => (
              <Stat key={c.key} label={t('cat.' + c.key + '.plural')} value={r.parCategorie[c.key]} />
            ))}
          </div>

          {/* Vue d'ensemble VIP / Classique */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted mb-2">{t('recap.overview')}</p>
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b border-line">
                    <th className="px-3 py-2 font-medium">{t('recap.rang')}</th>
                    <th className="px-3 py-2 font-medium text-right">{t('recap.adults')}</th>
                    <th className="px-3 py-2 font-medium text-right">{t('recap.children')}</th>
                    <th className="px-3 py-2 font-medium text-right">{t('recap.people')}</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {RANGS.map((rg, i) => {
                    const e = r.parRang[rg.key];
                    return (
                      <tr key={rg.key} className={i > 0 ? 'border-t border-line' : ''}>
                        <td className="px-3 py-2 text-ink">{t('rang.' + rg.key)}</td>
                        <td className="px-3 py-2 text-right text-muted">{e.adulte}</td>
                        <td className="px-3 py-2 text-right text-muted">{e.enfant}</td>
                        <td className="px-3 py-2 text-right text-ink font-semibold">{e.total}</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-line bg-cream/40">
                    <td className="px-3 py-2 text-ink font-semibold">{t('recap.totalGeneral')}</td>
                    <td className="px-3 py-2 text-right text-muted">{r.parCategorie.adulte}</td>
                    <td className="px-3 py-2 text-right text-muted">{r.parCategorie.enfant}</td>
                    <td className="px-3 py-2 text-right text-blush font-semibold">{r.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Par événement */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted mb-2">{t('recap.byEvent')}</p>
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b border-line">
                    <th className="px-3 py-2 font-medium">{t('recap.event')}</th>
                    <th className="px-3 py-2 font-medium text-right">{t('recap.adults')}</th>
                    <th className="px-3 py-2 font-medium text-right">{t('recap.children')}</th>
                    <th className="px-3 py-2 font-medium text-right">{t('recap.vendors')}</th>
                    <th className="px-3 py-2 font-medium text-right">{t('recap.total')}</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {EVENEMENTS.map((ev, i) => {
                    const e = r.parEvenement[ev.key];
                    return (
                      <tr key={ev.key} className={i > 0 ? 'border-t border-line' : ''}>
                        <td className="px-3 py-2 text-ink">
                          {t('event.' + ev.key)}
                          <span className="text-faint"> · {ev.date}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-muted">{e.adulte}</td>
                        <td className="px-3 py-2 text-right text-muted">{e.enfant}</td>
                        <td className="px-3 py-2 text-right text-muted">{e.prestataire}</td>
                        <td className="px-3 py-2 text-right text-ink font-semibold">{e.total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-faint italic">{t('recap.note')}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
