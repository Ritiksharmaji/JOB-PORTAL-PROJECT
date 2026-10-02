'use client';

import { Burger, Button, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAnchor, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_LINKS } from '@/config/routes';
import { useAppStore } from '@/store/app-store-provider';
import NotiMenu from './NotiMenu';
import ProfileMenu from './ProfileMenu';

export default function Header() {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppStore((s) => s.user);

  // Logged-out visitors see every link (the proxy sends them to /login).
  const links = user ? NAV_LINKS.filter((l) => l.roles.includes(user.accountType)) : NAV_LINKS;

  const go = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <header data-aos="zoom-out" className="flex h-20 w-full items-center justify-between bg-mine-shaft-950 px-6 text-mine-shaft-100">
      <Link href="/" className="flex items-center gap-1 text-bright-sun-400" aria-label="JobHook home">
        <IconAnchor className="h-8 w-8" stroke={2.5} />
        <span className="text-3xl font-semibold max-xs:hidden">JobHook</span>
      </Link>

      <nav className="flex h-full items-center gap-5 text-mine-shaft-300 max-bs:hidden" aria-label="Main">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex h-full items-center border-t-[3px] hover:text-mine-shaft-200 ${
              pathname === link.href ? 'border-bright-sun-400 text-bright-sun-400' : 'border-transparent'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <ProfileMenu />
            <NotiMenu />
          </>
        ) : (
          <Button component={Link} href="/login" color="brightSun.4" variant="subtle">
            Login
          </Button>
        )}
        <Burger className="bs:hidden" opened={opened} onClick={open} aria-label="Toggle navigation" />
        <Drawer
          size="xs"
          position="right"
          opened={opened}
          onClose={close}
          overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
          closeButtonProps={{ icon: <IconX size={30} /> }}
        >
          <nav className="flex flex-col items-center gap-6" aria-label="Mobile">
            {links.map((link) => (
              <button key={link.href} type="button" className="text-xl hover:text-bright-sun-400" onClick={() => go(link.href)}>
                {link.name}
              </button>
            ))}
          </nav>
        </Drawer>
      </div>
    </header>
  );
}
