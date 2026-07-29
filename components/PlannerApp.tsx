'use client';

import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { AuthProvider } from '@/lib/supabase/AuthProvider';
import AuthGate from '@/components/auth/AuthGate';
import Workspace from '@/components/Workspace';

/** Espace planner : thème + auth + workspace. */
export default function PlannerApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate>
          <Workspace />
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  );
}
