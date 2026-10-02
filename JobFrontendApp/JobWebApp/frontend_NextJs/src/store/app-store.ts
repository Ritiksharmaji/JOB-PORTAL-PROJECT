import { createStore } from 'zustand/vanilla';
import { clearPersistedSession, decodeSession, persistSession } from '@/lib/auth/session';
import { getErrorMessage } from '@/lib/api/client';
import { profileApi } from '@/lib/api/services';
import { errorNotification, successNotification } from '@/lib/notifications';
import type { Profile, SearchFilter, SessionUser, SortOption } from '@/types';

/**
 * One store, five slices — the Zustand equivalent of the React app's Redux slices
 * (JwtSlice, UserSlice, ProfileSlice, FilterSlice, SortSlice, OverlaySlice).
 */
export interface AppState {
  token: string;
  user: SessionUser | null;
  profile: Profile | null;
  filter: SearchFilter;
  sort: SortOption;
  /** Pending requests showing the global loading overlay (counter, so overlaps are safe). */
  pending: number;
}

export interface AppActions {
  // session
  login: (jwt: string) => boolean;
  logout: () => void;
  // profile
  loadProfile: () => Promise<void>;
  updateProfile: (changes: Partial<Profile>, successMessage?: string) => Promise<void>;
  toggleSavedJob: (jobId: number) => void;
  // filter & sort
  updateFilter: (changes: Partial<SearchFilter>) => void;
  resetFilter: () => void;
  setSort: (sort: SortOption) => void;
  // overlay
  track: <T>(promise: Promise<T>) => Promise<T>;
}

export type AppStore = AppState & AppActions;

/** Created once per request on the server and once in the browser (see AppStoreProvider). */
export function createAppStore(initialToken = '') {
  const initialUser = decodeSession(initialToken);

  return createStore<AppStore>()((set, get) => ({
    token: initialUser ? initialToken : '',
    user: initialUser,
    profile: null,
    filter: {},
    sort: 'Relevance',
    pending: 0,

    login: (jwt) => {
      const user = decodeSession(jwt);
      if (!user) return false;
      persistSession(jwt, user);
      set({ token: jwt, user, profile: null });
      void get().loadProfile();
      return true;
    },

    logout: () => {
      clearPersistedSession();
      set({ token: '', user: null, profile: null });
    },

    loadProfile: async () => {
      const profileId = get().user?.profileId;
      if (!profileId) return;
      try {
        set({ profile: await profileApi.getProfile(profileId) });
      } catch {
        /* handled by the 401 interceptor or ignored */
      }
    },

    // Optimistic: update the UI first, send the full profile, roll back on failure.
    updateProfile: async (changes, successMessage) => {
      const previous = get().profile;
      if (!previous) return;
      const updated = { ...previous, ...changes };
      set({ profile: updated });
      try {
        await profileApi.updateProfile(updated);
        if (successMessage) successNotification('Success', successMessage);
      } catch (err) {
        set({ profile: previous });
        errorNotification('Update Failed', getErrorMessage(err));
      }
    },

    toggleSavedJob: (jobId) => {
      const saved = get().profile?.savedJobs ?? [];
      void get().updateProfile({
        savedJobs: saved.includes(jobId) ? saved.filter((id) => id !== jobId) : [...saved, jobId],
      });
    },

    updateFilter: (changes) => set((state) => ({ filter: { ...state.filter, ...changes } })),
    resetFilter: () => set({ filter: {} }),
    setSort: (sort) => set({ sort }),

    track: async (promise) => {
      set((s) => ({ pending: s.pending + 1 }));
      try {
        return await promise;
      } finally {
        set((s) => ({ pending: Math.max(0, s.pending - 1) }));
      }
    },
  }));
}

/** True when any filter holds a value (drives the "Clear Filters" button). */
export function hasActiveFilters(filter: SearchFilter): boolean {
  return Object.values(filter).some((value) =>
    Array.isArray(value) ? value.length > 0 : value !== undefined && value !== '',
  );
}
