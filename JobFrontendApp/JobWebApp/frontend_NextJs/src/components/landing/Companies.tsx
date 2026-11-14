'use client';

import Image from 'next/image';
import Marquee from 'react-fast-marquee';
import { COMPANIES } from '@/data/landing';

export default function Companies() {
  return (
    <section className="mt-20 pb-5">
      <h2 data-aos="zoom-out" className="mb-10 text-center text-4xl font-semibold text-mine-shaft-100 max-md:text-3xl max-sm:text-2xl max-xs:text-xl">
        Trusted By <span className="text-bright-sun-400">1000+</span> Companies
      </h2>
      <Marquee pauseOnHover>
        {COMPANIES.map((company) => (
          <div key={company} className="mx-8 cursor-pointer rounded-xl px-2 py-1 hover:bg-mine-shaft-900 max-sm:mx-6 max-xs:mx-4 max-xsm:mx-2">
            <Image className="h-14 w-auto" src={`/Companies/${company}.png`} alt={company} width={160} height={56} />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
