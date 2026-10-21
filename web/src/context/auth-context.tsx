import type { LoginResponse } from "@/features/auth/mutations";
import React from "react";

export const authStorageKey = 'blog:platform:auth'
// Fired by the API client on a 401 for an authenticated request.
export const sessionExpiredEvent = 'auth:session-expired'

export type AuthContextType = {
  user: LoginResponse;
  login: (user: LoginResponse) => void;
  logout: () => void;
  /** Replace the stored session user with fresh server data (JWT kept). */
  updateUser: (fresh: LoginResponse["user"]) => void;
};

const syncAuthStateWithLocalStorage = () => {
  const storedUser = localStorage.getItem(authStorageKey);
  return storedUser ? JSON.parse(storedUser) : null;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<LoginResponse | null>(syncAuthStateWithLocalStorage());

  const login = (user: LoginResponse) => {
    setUser(user);
    localStorage.setItem(authStorageKey, JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(authStorageKey);
  };

  const updateUser = (fresh: LoginResponse["user"]) => {
    if (user) login({ ...user, user: fresh });
  };

  // The API client fires this on a 401 for an authenticated request.
  React.useEffect(() => {
    const onExpired = () => {
      setUser(null);
      localStorage.removeItem(authStorageKey);
    };
    globalThis.addEventListener(sessionExpiredEvent, onExpired);
    return () => globalThis.removeEventListener(sessionExpiredEvent, onExpired);
  }, []);

  return <AuthContext.Provider value={{ user: user!, login, logout, updateUser }}>{children}</AuthContext.Provider>;
};


// oxlint-disable-next-line react/only-export-components
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};