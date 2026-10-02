'use client';

import { Carousel } from '@mantine/carousel';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import Image from 'next/image';
import { JOB_CATEGORIES } from '@/data/landing';

export default function JobCategory() {
  return (
    <section className="mt-20 overflow-hidden pb-5">
      <h2 data-aos="zoom-out" className="mb-3 text-center text-4xl font-semibold text-mine-shaft-100 max-md:text-3xl max-sm:text-2xl max-xs:text-xl">
        Browse <span className="text-bright-sun-400">Job</span> Category
      </h2>
      <p data-aos="zoom-out" className="mx-auto mb-10 w-1/2 text-center text-lg text-mine-shaft-300 max-sm:w-11/12 max-sm:text-base max-xs:text-sm">
        Explore diverse job opportunities tailored to your skills. Start your career journey today!
      </p>
      <Carousel
        slideSize="22%"
        slideGap="md"
        emblaOptions={{ loop: true, align: 'start' }}
        nextControlIcon={<IconArrowRight className="h-8 w-8" />}
        previousControlIcon={<IconArrowLeft className="h-8 w-8" />}
        className="[&_button]:border-none! [&_button]:bg-bright-sun-400! [&_button]:opacity-0 hover:[&_button]:opacity-100"
      >
        {JOB_CATEGORIES.map((category) => (
          <Carousel.Slide key={category.name}>
            <div
              data-aos="zoom-out"
              className="my-5 flex w-64 flex-col items-center gap-2 rounded-xl border border-bright-sun-400 p-5 transition duration-300 ease-in-out hover:cursor-pointer hover:shadow-[0_0_5px_2px] hover:shadow-bright-sun-300 max-sm:w-56 max-xs:w-48"
            >
              <div className="rounded-full bg-bright-sun-300 p-2">
                <Image className="h-8 w-8 max-sm:h-6 max-sm:w-6 max-xs:h-4 max-xs:w-4" src={`/Category/${category.name}.png`} alt={category.name} width={32} height={32} />
              </div>
              <div className="text-xl font-semibold text-mine-shaft-100 max-sm:text-lg max-xs:text-base">{category.name}</div>
              <div className="text-center text-sm text-mine-shaft-300 max-xs:text-xs">{category.desc}</div>
              <div className="text-lg text-bright-sun-300 max-sm:text-base max-xs:text-sm">{category.jobs}+ new job posted</div>
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </section>
  );
}
