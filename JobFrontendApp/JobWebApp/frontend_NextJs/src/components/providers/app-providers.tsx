'use client';

import { LoadingOverlay, MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import AOS from 'aos';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { setUnauthorizedHandler } from '@/lib/api/client';
import { AppStoreProvider, useAppStore } from '@/store/app-store-provider';

const theme = createTheme({
  focusRing: 'never',
  fontFamily: 'var(--font-poppins), sans-serif',
  primaryColor: 'brightSun',
  primaryShade: 4,
  colors: {
    brightSun: ['#fffbeb', '#fff3c6', '#ffe588', '#ffd149', '#ffbd20', '#f99b07', '#dd7302', '#b75006', '#943c0c', '#7a330d', '#461902'],
    mineShaft: ['#f6f6f6', '#e7e7e7', '#d1d1d1', '#b0b0b0', '#888888', '#6d6d6d', '#5d5d5d', '#4f4f4f', '#454545', '#3d3d3d', '#2d2d2d'],
  },
});

/** Side effects that need the store + router: 401 handling, profile loading, animations. */
function AppBootstrap({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAppStore((s) => s.logout);
  const loadProfile = useAppStore((s) => s.loadProfile);
  const userId = useAppStore((s) => s.user?.id);
  const pending = useAppStore((s) => s.pending);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      router.push('/login');
    });
  }, [logout, router]);

  // Load the logged-in user's profile once the session is known.
  useEffect(() => {
    if (userId) void loadProfile();
  }, [userId, loadProfile]);

  useEffect(() => {
    AOS.init({ offset: 0, duration: 800, easing: 'ease-out' });
  }, []);

  // New page content needs AOS to re-scan for [data-aos] elements.
  useEffect(() => {
    const id = setTimeout(() => AOS.refresh(), 50);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <>
      <LoadingOverlay
        visible={pending > 0}
        pos="fixed"
        zIndex={2000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'brightSun.4', type: 'bars' }}
      />
      {children}
    </>
  );
}

export function AppProviders({
  initialToken,
  colorScheme,
  children,
}: {
  initialToken?: string;
  colorScheme: 'light' | 'dark';
  children: ReactNode;
}) {
  return (
    <AppStoreProvider initialToken={initialToken}>
      <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
        <Notifications position="top-center" zIndex={2001} />
        <AppBootstrap>{children}</AppBootstrap>
      </MantineProvider>
    </AppStoreProvider>
  );
}
