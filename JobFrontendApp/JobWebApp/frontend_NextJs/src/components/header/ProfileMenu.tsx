'use client';

import { Avatar, Menu, Switch, rem, useMantineColorScheme } from '@mantine/core';
import {
  IconFileText,
  IconLogout2,
  IconMessageCircle,
  IconMoon,
  IconMoonStars,
  IconSun,
  IconUserCircle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { persistTheme } from '@/lib/auth/session';
import { pictureSrc } from '@/lib/utils/file';
import { useAppStore } from '@/store/app-store-provider';

const iconStyle = { width: rem(14), height: rem(14) };

export default function ProfileMenu() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const logout = useAppStore((s) => s.logout);
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [opened, setOpened] = useState(false);
  const isLight = colorScheme === 'light';

  const toggleTheme = (light: boolean) => {
    const scheme = light ? 'light' : 'dark';
    document.documentElement.classList.toggle('light-theme', light); // Tailwind mine-shaft colours
    setColorScheme(scheme); // Mantine components
    persistTheme(scheme); // cookie -> correct theme on the next server render
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  return (
    <Menu shadow="md" width={200} opened={opened} onChange={setOpened}>
      <Menu.Target>
        <button type="button" className="flex items-center gap-2">
          <span className="max-xs:hidden">{user?.name}</span>
          <Avatar src={pictureSrc(profile?.picture)} alt="Your avatar" />
        </button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item component={Link} href="/profile" leftSection={<IconUserCircle style={iconStyle} />}>
          Profile
        </Menu.Item>
        <Menu.Item leftSection={<IconMessageCircle style={iconStyle} />}>Messages</Menu.Item>
        <Menu.Item leftSection={<IconFileText style={iconStyle} />}>Resume</Menu.Item>
        <Menu.Item
          closeMenuOnClick={false}
          onClick={() => toggleTheme(!isLight)}
          leftSection={<IconMoon style={iconStyle} />}
          rightSection={
            <Switch
              size="sm"
              color="dark"
              checked={isLight}
              onChange={(e) => toggleTheme(e.currentTarget.checked)}
              onClick={(e) => e.stopPropagation()}
              onLabel={<IconSun style={iconStyle} stroke={2.5} color="yellow" />}
              offLabel={<IconMoonStars style={iconStyle} stroke={2.5} color="cyan" />}
              aria-label="Toggle light mode"
            />
          }
        >
          {isLight ? 'Light Mode' : 'Dark Mode'}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item onClick={handleLogout} color="red" leftSection={<IconLogout2 style={iconStyle} />}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
