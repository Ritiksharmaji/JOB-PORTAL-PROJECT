'use client';

import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/** "Back" button: goes to `href` when given, otherwise browser history back. */
export default function BackButton({ href, className = 'my-5' }: { href?: string; className?: string }) {
  const router = useRouter();
  const common = { color: 'brightSun.4', variant: 'light', leftSection: <IconArrowLeft size={20} />, className } as const;
  return href ? (
    <Button component={Link} href={href} {...common}>
      Back
    </Button>
  ) : (
    <Button onClick={() => router.back()} {...common}>
      Back
    </Button>
  );
}
