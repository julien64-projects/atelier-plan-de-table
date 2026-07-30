'use client';

import { useState } from 'react';
import { useRoomState, useRoomDispatch } from '@/lib/store/roomStore';
import { useGuestState } from '@/lib/store/guestStore';
import { useAuth } from '@/lib/supabase/AuthProvider';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useT } from '@/lib/i18n/LangProvider';
import Section from './Section';
import RoomConfig from './RoomConfig';
import TableCatalog from './TableCatalog';
import TableInspector from './TableInspector';
import DecorCatalog from './DecorCatalog';
import DecorInspector from './DecorInspector';
import GuestList from './GuestList';
import AlleeAlert from './AlleeAlert';
import SharePanel from './SharePanel';
import AppearancePanel from './AppearancePanel';
import PasswordSetter from '../auth/PasswordSetter';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { selectedTableId, selectedDecorId, salleLargeurCm, salleHauteurCm, tables, decors } = useRoomState();
  const dispatch = useRoomDispatch();
  const { guests } = useGuestState();
  const { session, user, signOut } = useAuth();
  const { mode } = useTheme();
  const t = useT();

  // Sections paramétrées par le planner : repliées par défaut.
  const [salleOpen, setSalleOpen] = useState(false);
  const [mobilierOpen, setMobilierOpen] = useState(false);
  const [alleesOpen, setAlleesOpen] = useState(false);
  // Sections de travail : dépliées par défaut.
  const [tablesOpen, setTablesOpen] = useState(true);
  const [invitesOpen, setInvitesOpen] = useState(true);
  const [partageOpen, setPartageOpen] = useState(false);
  const [apparenceOpen, setApparenceOpen] = useState(false);

  // Une sélection ouvre sa section ; replier depuis l'en-tête désélectionne
  // pour ne pas rester bloqué ouvert.
  const toggleMobilier = () => {
    if (mobilierOpen || selectedDecorId) {
      setMobilierOpen(false);
      if (selectedDecorId) dispatch({ type: 'SELECT_DECOR', id: null });
    } else {
      setMobilierOpen(true);
    }
  };
  const toggleTables = () => {
    if (tablesOpen || selectedTableId) {
      setTablesOpen(false);
      if (selectedTableId) dispatch({ type: 'SELECT_TABLE', id: null });
    } else {
      setTablesOpen(true);
    }
  };

  const m = (cm: number) => Math.round(cm / 100);

  return (
    <aside className="w-80 max-w-[85vw] h-full shrink-0 border-r border-line bg-surface flex flex-col overflow-y-auto">
      <div className="px-5 py-6 border-b border-line text-center relative">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="lg:hidden absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-muted hover:text-ink text-lg leading-none"
          >
            ✕
          </button>
        )}
        <p className="text-[10px] uppercase tracking-[0.3em] text-blush font-semibold">{t('brand.eyebrow')}</p>
        <h1 className="text-[27px] leading-tight text-ink mt-1">TablePlan</h1>
        <div className="flex items-center justify-center gap-3 text-gold my-2.5">
          <span className="h-px w-8 bg-gold/50" />
          <span className="text-xs">&#10086;</span>
          <span className="h-px w-8 bg-gold/50" />
        </div>
        <p className="text-xs text-muted italic">{t('brand.tagline.sidebar')}</p>
      </div>

      <Section title={t('section.salle')} open={salleOpen} onToggle={() => setSalleOpen(o => !o)}
        hint={`${m(salleLargeurCm)} × ${m(salleHauteurCm)} m`} locked>
        <RoomConfig />
      </Section>

      <Section title={t('section.mobilier')} open={mobilierOpen || !!selectedDecorId}
        onToggle={toggleMobilier} hint={`${decors.length} élément${decors.length > 1 ? 's' : ''}`} locked>
        <div className="space-y-5">
          <DecorCatalog />
          {selectedDecorId && (
            <div className="pt-4 border-t border-line">
              <DecorInspector />
            </div>
          )}
        </div>
      </Section>

      <Section title={t('section.distances')} open={alleesOpen} onToggle={() => setAlleesOpen(o => !o)}>
        <AlleeAlert />
      </Section>

      <Section title={t('section.tables')} open={tablesOpen || !!selectedTableId}
        onToggle={toggleTables} hint={`${tables.length} table${tables.length > 1 ? 's' : ''}`}>
        <div className="space-y-5">
          <TableCatalog />
          {selectedTableId && (
            <div className="pt-4 border-t border-line">
              <TableInspector />
            </div>
          )}
        </div>
      </Section>

      <Section title={t('section.invites')} open={invitesOpen} onToggle={() => setInvitesOpen(o => !o)}
        hint={`${guests.length} invité${guests.length > 1 ? 's' : ''}`}>
        <GuestList />
      </Section>

      <Section title={t('section.partage')} open={partageOpen} onToggle={() => setPartageOpen(o => !o)}>
        <SharePanel />
      </Section>

      <Section title={t('section.apparence')} open={apparenceOpen} onToggle={() => setApparenceOpen(o => !o)}
        hint={mode === 'clair' ? t('common.clair') : t('common.sombre')}>
        <AppearancePanel />
      </Section>

      {session && (
        <div className="mt-auto px-5 py-4 border-t border-line space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-faint truncate" title={user?.email ?? ''}>{user?.email}</span>
            <button
              onClick={() => signOut()}
              className="shrink-0 text-xs text-muted hover:text-ink transition-colors"
            >
              {t('auth.signout')}
            </button>
          </div>
          <PasswordSetter />
        </div>
      )}
    </aside>
  );
}
