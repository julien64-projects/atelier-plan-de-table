'use client';

import { AuthProvider } from '@/lib/supabase/AuthProvider';
import AuthGate from '@/components/auth/AuthGate';
import Workspace from '@/components/Workspace';

/** Espace planner : auth + workspace. */
export default function PlannerApp() {
  return (
    <AuthProvider>
      <AuthGate>
        <Workspace />
      </AuthGate>
    </AuthProvider>
  );
}
