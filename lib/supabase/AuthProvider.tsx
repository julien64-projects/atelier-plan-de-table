'use client';

/**
 * Contexte d'authentification planner (Supabase Auth, email + mot de passe).
 *
 * Sécurité : le vrai contrôle d'accès est la RLS côté base. Ce contexte gère
 * seulement la session et l'UI. Tant que Supabase n'est pas configuré
 * (`configured === false`), l'app reste utilisable en local (aucun login).
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './client';

interface AuthResult {
  error?: string;
  needsConfirmation?: boolean;
  /** L'adresse a déjà un compte : aucun email ne partira. */
  dejaInscrit?: boolean;
}

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  /** Envoie un lien de réinitialisation à l'adresse indiquée. */
  demanderReinitialisation: (email: string) => Promise<AuthResult>;
  /** Change le mot de passe de la session en cours. */
  changerMotDePasse: (motDePasse: string) => Promise<AuthResult>;
  /** Change l'adresse : Supabase envoie une confirmation à la NOUVELLE adresse. */
  changerEmail: (email: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue>({
  configured: false,
  loading: false,
  session: null,
  user: null,
  signIn: async () => ({ error: 'Auth non configurée' }),
  signUp: async () => ({ error: 'Auth non configurée' }),
  signOut: async () => {},
  demanderReinitialisation: async () => ({ error: 'Auth non configurée' }),
  changerMotDePasse: async () => ({ error: 'Auth non configurée' }),
  changerEmail: async () => ({ error: 'Auth non configurée' }),
});

/** Traduit les messages d'erreur Supabase courants en français. */
function messageErreur(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('invalid login')) return 'Email ou mot de passe incorrect.';
  if (m.includes('already registered')) return 'Un compte existe déjà avec cet email.';
  if (m.includes('password should be')) return 'Le mot de passe doit faire au moins 6 caractères.';
  if (m.includes('email')) return 'Adresse email invalide.';
  return raw;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = supabase !== null;
  const [loading, setLoading] = useState(configured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: 'Auth non configurée' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: messageErreur(error.message) } : {};
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: 'Auth non configurée' };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: messageErreur(error.message) };

    // Adresse DÉJÀ inscrite : Supabase renvoie un succès de façade, sans
    // identité ni session, et n'envoie aucun email — c'est volontaire, pour
    // qu'on ne puisse pas deviner quelles adresses ont un compte. Sans ce
    // test, on annonçait « vérifie tes emails » pour un message qui ne
    // partirait jamais.
    const dejaInscrit = !!data.user && (data.user.identities?.length ?? 0) === 0;

    // Pas de session renvoyée => confirmation par email requise.
    if (!data.session) return { needsConfirmation: true, dejaInscrit };
    return {};
  }, []);

  const demanderReinitialisation = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { error: 'Auth non configurée' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reinitialiser`,
    });
    return error ? { error: messageErreur(error.message) } : {};
  }, []);

  const changerMotDePasse = useCallback(async (motDePasse: string): Promise<AuthResult> => {
    if (!supabase) return { error: 'Auth non configurée' };
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    return error ? { error: messageErreur(error.message) } : {};
  }, []);

  const changerEmail = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { error: 'Auth non configurée' };
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    // L'adresse ne change RÉELLEMENT qu'après clic sur le lien de confirmation
    // envoyé à la nouvelle boîte : d'ici là, l'ancienne reste valable.
    return error ? { error: messageErreur(error.message) } : { needsConfirmation: true };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        configured,
        loading,
        session,
        user: session?.user ?? null,
        signIn,
        signUp,
        signOut,
        demanderReinitialisation,
        changerMotDePasse,
        changerEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
