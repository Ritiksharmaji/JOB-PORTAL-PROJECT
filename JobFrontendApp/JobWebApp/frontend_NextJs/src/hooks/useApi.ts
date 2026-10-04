'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store-provider';

/**
 * Loads data on mount / when `deps` change and ignores stale responses.
 * `overlay: true` shows the global loading overlay while the request runs.
 *
 *   const { data, loading, reload } = useApi(() => jobApi.getJob(id), [id], { overlay: true });
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[], { overlay = false } = {}) {
  const track = useAppStore((s) => s.track);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const promise = fetcher();
    (overlay ? track(promise) : promise)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass the fetcher's inputs as deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data, error, loading, reload, setData };
}
