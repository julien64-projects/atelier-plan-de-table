'use client';

import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { LangProvider } from '@/lib/i18n/LangProvider';
import { AuthProvider } from '@/lib/supabase/AuthProvider';
import AuthGate from '@/components/auth/AuthGate';
import Workspace from '@/components/Workspace';

/** Espace planner : langue + thème + auth + workspace. */
export default function PlannerApp() {
  return (
    <LangProvider>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate>
            <Workspace />
          </AuthGate>
        </AuthProvider>
      </ThemeProvider>
    </LangProvider>
  );
}
