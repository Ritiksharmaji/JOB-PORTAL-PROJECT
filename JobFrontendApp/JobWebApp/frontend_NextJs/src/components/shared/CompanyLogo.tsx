'use client';

import { useState } from 'react';

const FALLBACK = '/anchor.png';

/**
 * Company logo from /public/Icons with a fallback for companies that have no
 * logo file (user-typed company names). A plain <img> is used because the
 * source switches on error, which next/image does not support well.
 */
export default function CompanyLogo({ name, className = 'h-7 w-7' }: { name?: string; className?: string }) {
  const wanted = name ? `/Icons/${name}.png` : FALLBACK;
  const [failed, setFailed] = useState<string | null>(null);
  const src = failed === wanted ? FALLBACK : wanted;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`object-contain ${className}`} src={src} alt="" onError={() => setFailed(wanted)} />;
}
