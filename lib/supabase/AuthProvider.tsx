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
}

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  setPassword: (password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  configured: false,
  loading: false,
  session: null,
  user: null,
  signIn: async () => ({ error: 'Auth non configurée' }),
  signUp: async () => ({ error: 'Auth non configurée' }),
  setPassword: async () => ({ error: 'Auth non configurée' }),
  signOut: async () => {},
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
    // Pas de session renvoyée => confirmation par email requise.
    if (!data.session) return { needsConfirmation: true };
    return {};
  }, []);

  const setPassword = useCallback(async (password: string): Promise<AuthResult> => {
    if (!supabase) return { error: 'Auth non configurée' };
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { error: messageErreur(error.message) } : {};
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
        setPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
