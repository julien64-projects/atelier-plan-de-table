import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { LangProvider } from '@/lib/i18n/LangProvider';
import { AuthProvider } from '@/lib/supabase/AuthProvider';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata = {
  title: 'TablePlan — Nouveau mot de passe',
  robots: { index: false, follow: false },
};

/** Cible du lien de réinitialisation envoyé par email. */
export default function ReinitialiserPage() {
  return (
    <LangProvider>
      <ThemeProvider>
        <AuthProvider>
          <ResetPasswordForm />
        </AuthProvider>
      </ThemeProvider>
    </LangProvider>
  );
}
