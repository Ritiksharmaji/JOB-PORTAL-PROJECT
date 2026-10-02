import Image from 'next/image';
import { WORK_STEPS } from '@/data/landing';

/** Server component — static content only. */
export default function Working() {
  return (
    <section className="mt-20 overflow-hidden pb-5">
      <h2 data-aos="zoom-out" className="mb-3 text-center text-4xl font-semibold text-mine-shaft-100 max-md:text-3xl max-sm:text-2xl max-xs:text-xl">
        How it <span className="text-bright-sun-400">Works</span>
      </h2>
      <p data-aos="zoom-out" className="mx-auto mb-10 w-1/2 text-center text-lg text-mine-shaft-300 max-sm:w-11/12 max-sm:text-base max-xs:text-sm">
        Effortlessly navigate through the process and land your dream job.
      </p>
      <div className="flex items-center justify-between gap-2 px-16 max-bs:px-10 max-md:flex-col max-md:px-5">
        <div data-aos="fade-right" className="relative">
          <Image className="h-auto w-[30rem]" src="/Working/Girl.png" alt="Applicant completing her profile" width={480} height={480} />
          <div className="absolute top-[15%] right-0 flex w-36 flex-col items-center gap-1 rounded-xl border border-bright-sun-400 px-1 py-3 backdrop-blur-md max-xs:w-28">
            <Image className="h-16 w-16 rounded-full max-xs:h-12 max-xs:w-12" src="/avatar1.png" alt="" width={64} height={64} />
            <div className="text-center text-sm font-semibold text-mine-shaft-200 max-sm:text-xs">Complete your profile</div>
            <div className="text-xs text-mine-shaft-300">70% Completed</div>
          </div>
        </div>
        <div data-aos="fade-left" className="flex flex-col gap-10">
          {WORK_STEPS.map((step) => (
            <div key={step.name} className="flex items-center gap-4">
              <div className="rounded-full bg-bright-sun-300 p-2.5">
                <Image className="h-12 w-12 max-md:h-9 max-md:w-9 max-sm:h-7 max-sm:w-7" src={`/Working/${step.image}.png`} alt={step.name} width={48} height={48} />
              </div>
              <div>
                <div className="text-xl font-semibold text-mine-shaft-200 max-md:text-lg max-sm:text-base">{step.name}</div>
                <div className="text-mine-shaft-300 max-md:text-sm max-sm:text-xs">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
