import React from "react";
import type { LoginResponse } from "@/features/auth/mutations";
import {
  AuthContext,
  authStorageKey,
  readStoredSession,
  sessionExpiredEvent,
  sessionRefreshedEvent,
} from "./auth-store";

const persist = (session: LoginResponse | null) => {
  if (session) localStorage.setItem(authStorageKey, JSON.stringify(session));
  else localStorage.removeItem(authStorageKey);
  return session;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<LoginResponse | null>(readStoredSession);

  const login = (session: LoginResponse) => setUser(persist(session));
  const logout = () => setUser(persist(null));
  // Functional updates: always build on the latest session (the token may have been refreshed).
  const updateUser = (fresh: LoginResponse["user"]) =>
    setUser((prev) => (prev ? persist({ ...prev, user: fresh }) : prev));

  React.useEffect(() => {
    const onExpired = () => setUser(persist(null));
    const onRefreshed = (e: Event) => {
      const jwt = (e as CustomEvent<string>).detail;
      setUser((prev) => (prev ? persist({ ...prev, jwt }) : prev));
    };
    globalThis.addEventListener(sessionExpiredEvent, onExpired);
    globalThis.addEventListener(sessionRefreshedEvent, onRefreshed);
    return () => {
      globalThis.removeEventListener(sessionExpiredEvent, onExpired);
      globalThis.removeEventListener(sessionRefreshedEvent, onRefreshed);
    };
  }, []);

  return <AuthContext.Provider value={{ user: user!, login, logout, updateUser }}>{children}</AuthContext.Provider>;
};
