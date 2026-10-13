// src/api.ts
import { authStorageKey } from '@/context/auth-context';
import { createClient, KickClientError } from '@forinda/kickjs-client'

const authData = JSON.parse(globalThis.localStorage.getItem(authStorageKey) || 'null')

export const api = createClient<KickClientApi.Api>({
    baseUrl: '/api/v1',
    headers: {
        ...(authData?.jwt ? { Authorization: `Bearer ${authData.jwt}` } : {})
    }
})


export const extractError = (error: unknown, fallbackMsg = '') => {
    if (error instanceof KickClientError) {
        return error.message;
    }
    return fallbackMsg || "An unknown error occurred.";
}