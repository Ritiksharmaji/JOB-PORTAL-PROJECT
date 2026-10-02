import axios, { AxiosError } from 'axios';
import { STORAGE_KEYS } from '@/lib/auth/session';

/** Backend base URL — set NEXT_PUBLIC_API_URL in .env.local (see .env.example). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://job-portal-project-1-f7oc.onrender.com';

/** Single axios instance shared by every API service. */
export const api = axios.create({ baseURL: API_URL });

// Attach `Authorization: Bearer <token>` to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;

/** Registered once by <AppProviders>: clears the session and goes to /login on HTTP 401. */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) onUnauthorized?.();
    return Promise.reject(error);
  },
);

/** The backend returns errors as `{ errorMessage }` with HTTP 400/500. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { errorMessage?: string } | undefined)?.errorMessage;
    if (message) return message;
    if (!error.response) return 'Cannot reach the server. Check your connection or the API URL.';
  }
  return fallback;
}
