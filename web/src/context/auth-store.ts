import React from "react";
import type { LoginResponse } from "@/features/auth/mutations";

// Everything auth-related that isn't a component lives here, so auth-context.tsx exports only
// <AuthProvider> and Vite can hot-reload it (a mixed file forces a full reload and, mid-session,
// left consumers holding a different context object than the provider: "useAuth must be used
// within an AuthProvider").

export const authStorageKey = "blog:platform:auth";
/** Fired by the API client on a 401 for an authenticated request. */
export const sessionExpiredEvent = "auth:session-expired";
/** Fired by the API client after it swaps the token for a fresh one; detail = new JWT. */
export const sessionRefreshedEvent = "auth:session-refreshed";

export type AuthContextType = {
  user: LoginResponse;
  login: (user: LoginResponse) => void;
  logout: () => void;
  /** Replace the stored session user with fresh server data (JWT kept). */
  updateUser: (fresh: LoginResponse["user"]) => void;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);

export const readStoredSession = (): LoginResponse | null =>
  JSON.parse(globalThis.localStorage.getItem(authStorageKey) || "null");

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
