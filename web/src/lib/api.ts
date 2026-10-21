// src/api.ts
import { authStorageKey, readStoredSession, sessionExpiredEvent, sessionRefreshedEvent } from "@/context/auth-store";
import { createClient, KickClientError } from "@forinda/kickjs-client";
import axios, { isAxiosError, type AxiosResponse } from "axios";

// Shared axios instance: the typed client and raw calls (e.g. multipart uploads) both go through it.
export const http = axios.create();

// Sliding sessions: tokens last 2h; when one is within this window of expiring, the next
// request first swaps it for a fresh one. Active users stay signed in; 2h idle still ends it.
const REFRESH_WITHIN_MS = 30 * 60 * 1000;
let refreshing: Promise<void> | null = null;

const expiresAt = (jwt: string) => {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const refreshIfStale = async () => {
  const jwt = readStoredSession()?.jwt;
  const exp = jwt ? expiresAt(jwt) : null;
  if (!jwt || !exp || exp - Date.now() > REFRESH_WITHIN_MS || exp <= Date.now()) return;
  // One refresh shared by every request that notices at the same time. Plain axios (not
  // `http`) so this call doesn't re-enter these interceptors.
  refreshing ??= axios
    .post<{ jwt: string }>("/api/v1/auth/refresh", null, { headers: { Authorization: `Bearer ${jwt}` } })
    .then(({ data }) => {
      globalThis.dispatchEvent(new CustomEvent(sessionRefreshedEvent, { detail: data.jwt }));
      const session = readStoredSession(); // write now too, so requests in flight pick it up
      if (session) globalThis.localStorage.setItem(authStorageKey, JSON.stringify({ ...session, jwt: data.jwt }));
    })
    .catch(() => {}) // a failed refresh just means the current token is used until it expires
    .finally(() => {
      refreshing = null;
    });
  await refreshing;
};

// Request: refresh if needed, then attach the JWT (read per request, so a fresh login/logout
// applies without a reload).
http.interceptors.request.use(async (config) => {
  await refreshIfStale();
  const jwt = readStoredSession()?.jwt;
  if (jwt) config.headers.set("Authorization", `Bearer ${jwt}`);
  return config;
});

// Response: an expired/invalid token on an authenticated call ends the session.
// AuthProvider listens for this event and logs out; <Protect> then handles the redirect + _next.
// Unauthenticated 401s (e.g. wrong password on sign-in) are left to the caller.
const handleUnauthorized = (response?: AxiosResponse) => {
  if (response?.status !== 401 || !response.config.headers.has("Authorization")) return;
  globalThis.dispatchEvent(new Event(sessionExpiredEvent));
};

http.interceptors.response.use(
  (response) => {
    handleUnauthorized(response);
    return response;
  },
  (error) => {
    if (isAxiosError(error)) handleUnauthorized(error.response);
    return Promise.reject(error);
  },
);

export const api = createClient<KickClientApi.Api>({
  baseUrl: "/api/v1",
  fetch: async (request) => {
    const res = await http({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      data: request.body ? await request.text() : undefined,
      signal: request.signal,
      responseType: "arraybuffer",
      validateStatus: () => true, // KickClientError owns non-2xx, not axios
    });

    const headers = new Headers();
    for (const [key, value] of Object.entries(res.headers)) {
      if (value == null) continue;
      for (const one of Array.isArray(value) ? value : [value]) {
        headers.append(key, String(one));
      }
    }
    const empty = res.status === 204 || res.status === 205 || res.status === 304;
    return new Response(empty ? null : res.data, {
      status: res.status,
      headers,
    });
  },
});

export const extractError = (error: unknown, fallbackMsg = "") => {
  if (error instanceof KickClientError) {
    // The client reads `detail`/`error`; middleware such as the rate limiter answers with `message`.
    const body = error.body as { detail?: string; message?: string } | undefined;
    return body?.detail ?? body?.message ?? error.message;
  }
  if (isAxiosError(error)) {
    const data = error.response?.data;
    return data?.detail ?? data?.title ?? data?.message ?? error.message;
  }
  return fallbackMsg || "An unknown error occurred.";
};
