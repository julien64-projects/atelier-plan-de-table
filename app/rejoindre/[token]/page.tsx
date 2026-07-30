import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { LangProvider } from '@/lib/i18n/LangProvider';
import JoinByLink from '@/components/auth/JoinByLink';

export const metadata = {
  title: 'TablePlan — Rejoindre un plan de table',
  robots: { index: false, follow: false },
};

/** Point d'entrée d'un lien de partage : /rejoindre/<token>. */
export default async function RejoindrePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <LangProvider>
      <ThemeProvider>
        <JoinByLink token={token} />
      </ThemeProvider>
    </LangProvider>
  );
}
