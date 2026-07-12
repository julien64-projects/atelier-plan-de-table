'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/lib/supabase/AuthProvider';
import LoginForm from './LoginForm';

/**
 * Protège l'espace planner : affiche le login tant qu'aucune session.
 * Si Supabase n'est pas configuré, laisse passer (app locale de secours).
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const { configured, loading, session } = useAuth();

  if (!configured) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--background)]">
        <span className="text-sm text-muted">Chargement…</span>
      </div>
    );
  }

  if (!session) return <LoginForm />;

  return <>{children}</>;
}
