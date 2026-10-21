// src/api.ts
import { authStorageKey, sessionExpiredEvent } from "@/context/auth-context";
import { createClient, KickClientError } from "@forinda/kickjs-client";
import axios, { isAxiosError, type AxiosResponse } from "axios";

// Shared axios instance: the typed client and raw calls (e.g. multipart uploads) both go through it.
export const http = axios.create();

// Request: attach the JWT, read per request so a fresh login/logout applies without a reload.
http.interceptors.request.use((config) => {
  const authData = JSON.parse(globalThis.localStorage.getItem(authStorageKey) || "null");
  if (authData?.jwt) config.headers.set("Authorization", `Bearer ${authData.jwt}`);
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
    return error.message;
  }
  if (isAxiosError(error)) {
    const data = error.response?.data;
    return data?.detail ?? data?.title ?? data?.message ?? error.message;
  }
  return fallbackMsg || "An unknown error occurred.";
};
