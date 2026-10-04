'use client';

import { Avatar, Rating } from '@mantine/core';
import { TESTIMONIALS } from '@/data/landing';

export default function Testimonials() {
  return (
    <section className="mt-20 overflow-hidden p-5 pb-5">
      <h2 data-aos="zoom-out" className="mb-3 text-center text-4xl font-semibold text-mine-shaft-100 max-md:text-3xl max-sm:text-2xl max-xs:text-xl">
        What <span className="text-bright-sun-400">User</span> says about us?
      </h2>
      <div className="mt-10 flex justify-evenly gap-5 max-md:flex-wrap">
        {TESTIMONIALS.map((item) => (
          <figure key={item.name} data-aos="zoom-in" className="flex w-[23%] flex-col gap-3 rounded-xl border border-bright-sun-400 p-3 max-md:w-[48%] max-xs:w-full">
            <div className="flex items-center gap-2">
              <Avatar className="h-14! w-14!" src="/avatar.png" alt="" />
              <div>
                <figcaption className="text-lg font-semibold text-mine-shaft-100 max-sm:text-base max-xs:text-sm">{item.name}</figcaption>
                <Rating value={item.rating} fractions={2} readOnly />
              </div>
            </div>
            <blockquote className="text-xs text-mine-shaft-300">{item.testimonial}</blockquote>
          </figure>
        ))}
      </div>
    </section>
  );
}
