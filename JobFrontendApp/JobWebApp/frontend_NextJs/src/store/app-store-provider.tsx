'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createAppStore, type AppStore } from './app-store';

type AppStoreApi = ReturnType<typeof createAppStore>;

const AppStoreContext = createContext<AppStoreApi | null>(null);

/**
 * Provides the Zustand store through context (the pattern Zustand recommends for
 * Next.js) so the server never shares state between requests. `initialToken`
 * comes from the `token` cookie, so the first server render already knows the user.
 */
export function AppStoreProvider({ initialToken, children }: { initialToken?: string; children: ReactNode }) {
  const [store] = useState(() => createAppStore(initialToken));
  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

/** Select a slice of app state: `const user = useAppStore((s) => s.user)`. */
export function useAppStore<T>(selector: (store: AppStore) => T): T {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error('useAppStore must be used inside <AppStoreProvider>');
  return useStore(store, selector);
}
