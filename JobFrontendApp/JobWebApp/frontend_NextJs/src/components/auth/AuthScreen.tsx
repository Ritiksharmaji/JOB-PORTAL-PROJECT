'use client';

import { Button } from '@mantine/core';
import { IconAnchor, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Login from './Login';
import SignUp from './SignUp';

/** Sliding canvas: [ Login | Brand | Sign up ]. Slides left on /signup. */
export default function AuthScreen() {
  const isSignup = usePathname() === '/signup';

  return (
    <div data-aos="zoom-out" className="relative h-screen w-screen overflow-hidden max-sm:overflow-y-auto">
      <Button component={Link} href="/" size="sm" className="absolute! left-5 z-10" my="lg" color="brightSun.4" leftSection={<IconArrowLeft size={20} />} variant="light">
        Home
      </Button>

      <div
        className={`relative flex transition-all duration-1000 ease-in-out *:shrink-0 ${
          isSignup ? '-translate-x-1/2 max-sm:-translate-x-full' : 'translate-x-0'
        }`}
      >
        <Login />
        <div
          className={`flex h-screen w-1/2 flex-col items-center justify-center gap-5 bg-mine-shaft-900 transition-all duration-1000 max-sm:hidden ${
            isSignup ? 'rounded-r-[200px]' : 'rounded-l-[200px]'
          }`}
        >
          <div className="flex items-center gap-1 text-bright-sun-400">
            <IconAnchor className="h-16 w-16" stroke={2.5} />
            <div className="text-6xl font-semibold max-bs:text-5xl max-md:text-4xl max-sm:text-3xl">JobHook</div>
          </div>
          <div className="text-2xl font-semibold text-mine-shaft-200 max-bs:text-xl max-md:text-lg">Find the job made for you</div>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
