/**
 * Who is signed in, and what the server says they may do.
 *
 * `roles` is only ever what the server reported. ADR 0006's first invariant is
 * that a valid token proves identity and nothing else, so the role check here
 * decides what to *render*, never what is *permitted* — every console route on
 * the server denies by absence of claim regardless of what this component
 * believes. Hiding a page the user cannot use is a courtesy; it is not a
 * control, and treating it as one is how a client-side guard becomes the only
 * guard.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { ConsoleUser, Role } from '../api/types';

interface AuthState {
  user: ConsoleUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  can: (role: Role) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ConsoleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const client = await api();
        const current = await client.currentUser();
        if (!cancelled) setUser(current);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      const client = await api();
      setUser(await client.signIn(email));
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인하지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    const client = await api();
    await client.signOut();
    setUser(null);
  }, []);

  const can = useCallback(
    (role: Role) => Boolean(user && (user.roles.includes(role) || user.roles.includes('admin'))),
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
