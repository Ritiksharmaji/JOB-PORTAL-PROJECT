import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { cookies } from 'next/headers';
import { AppProviders } from '@/components/providers/app-providers';
import { STORAGE_KEYS } from '@/lib/auth/session';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: { default: 'JobHook', template: 'JobHook | %s' },
  description: 'JobHook — find the job made for you.',
  icons: { icon: '/anchor.png' },
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // Reading the cookies lets the server render the right user and theme on the
  // first paint (no "logged out" or light/dark flash before hydration).
  const cookieStore = await cookies();
  const token = cookieStore.get(STORAGE_KEYS.token)?.value;
  const colorScheme = cookieStore.get(STORAGE_KEYS.theme)?.value === 'light' ? 'light' : 'dark';

  return (
    <html
      lang="en"
      {...mantineHtmlProps}
      className={`${poppins.variable} ${colorScheme === 'light' ? 'light-theme' : ''}`}
    >
      <head>
        <ColorSchemeScript defaultColorScheme={colorScheme} />
      </head>
      <body>
        <AppProviders initialToken={token} colorScheme={colorScheme}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
