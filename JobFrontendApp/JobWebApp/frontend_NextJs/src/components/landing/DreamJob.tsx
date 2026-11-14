'use client';

import { Avatar, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

/** Hero with a quick search; filters are passed to Find Jobs in the URL. */
export default function DreamJob() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('');

  const search = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (jobTitle.trim()) params.set('jobTitle', jobTitle.trim());
    if (jobType.trim()) params.set('jobType', jobType.trim());
    router.push(`/find-jobs${params.size ? `?${params}` : ''}`);
  };

  const inputClass = 'min-w-0 flex-1 rounded-lg bg-mine-shaft-900 p-1 px-2 [&_input]:text-mine-shaft-100!';

  return (
    <section className="flex items-center px-16 max-bs:px-10 max-md:px-5 max-sm:flex-col-reverse">
      <div data-aos="zoom-out-right" className="flex w-[45%] flex-col gap-3 max-sm:w-full">
        <h1 className="text-6xl leading-tight font-bold text-mine-shaft-100 max-bs:text-5xl max-md:text-4xl max-sm:text-3xl">
          Find your <span className="text-bright-sun-400">dream</span> <span className="text-bright-sun-400">job</span> with us
        </h1>
        <p className="text-lg text-mine-shaft-200 max-md:text-base max-sm:text-sm">
          Good life begins with a good company. Start explore thousands of jobs in one place.
        </p>
        <form className="mt-5 flex items-stretch gap-3" onSubmit={search}>
          <TextInput value={jobTitle} onChange={(e) => setJobTitle(e.currentTarget.value)} className={inputClass} variant="unstyled" label="Job Title" placeholder="Software Engineer" />
          <TextInput value={jobType} onChange={(e) => setJobType(e.currentTarget.value)} className={inputClass} variant="unstyled" label="Job Type" placeholder="Fulltime" />
          <button type="submit" aria-label="Search jobs" className="flex w-20 shrink-0 items-center justify-center rounded-lg bg-bright-sun-400 p-2 text-mine-shaft-100 hover:bg-bright-sun-500 max-xs:w-12">
            <IconSearch className="h-[85%] w-[85%]" />
          </button>
        </form>
      </div>

      <div data-aos="zoom-out-left" className="flex w-[55%] items-center justify-center max-sm:w-full">
        <div className="relative w-[30rem]">
          <Image src="/Boy.png" alt="Job seeker" width={480} height={480} priority className="h-auto w-full" />
          <div className="absolute top-[50%] -right-10 w-fit rounded-lg border border-bright-sun-400 p-2 backdrop-blur-md max-bs:right-0 max-xs:top-[10%] max-xs:-left-5">
            <div className="mb-1 text-center text-sm text-mine-shaft-100">10K+ got job</div>
            <Avatar.Group>
              <Avatar src="/avatar.png" />
              <Avatar src="/avatar1.png" />
              <Avatar src="/avatar2.png" />
              <Avatar>+9K</Avatar>
            </Avatar.Group>
          </div>
          <div className="absolute top-[28%] flex w-fit flex-col gap-3 rounded-lg border border-bright-sun-400 p-2 backdrop-blur-md xs:-left-5 max-bs:top-[35%] max-xs:top-[60%] max-xs:right-0">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-mine-shaft-900 p-1">
                <Image src="/Google.png" alt="" width={32} height={32} />
              </div>
              <div className="text-sm text-mine-shaft-100">
                <div>Software Engineer</div>
                <div className="text-xs text-mine-shaft-200">New York</div>
              </div>
            </div>
            <div className="flex justify-around gap-2 text-xs text-mine-shaft-200">
              <span>1 day ago</span>
              <span>120 Applicants</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
