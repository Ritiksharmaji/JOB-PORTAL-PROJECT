import AuthScreen from '@/components/auth/AuthScreen';

/**
 * /login and /signup share this layout, so the sliding auth panel stays mounted
 * while switching between them and the slide animation plays. The pages
 * themselves only set the title.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthScreen />
      {children}
    </>
  );
}
