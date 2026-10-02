'use client';

import { Button, Divider, Text } from '@mantine/core';
import { IconBookmark, IconBookmarkFilled, IconCalendarMonth, IconClockHour3 } from '@tabler/icons-react';
import Link from 'next/link';
import CompanyLogo from '@/components/shared/CompanyLogo';
import { formatInterviewTime, timeAgo } from '@/lib/utils/date';
import { useAppStore } from '@/store/app-store-provider';
import type { Job } from '@/types';

export type JobCardVariant = 'default' | 'applied' | 'saved' | 'offered' | 'interviewing';

const TIME_LABEL: Record<JobCardVariant, string> = {
  default: 'Posted',
  saved: 'Posted',
  applied: 'Applied',
  interviewing: 'Applied',
  offered: 'Interviewed',
};

/** Job summary card used by Find Jobs, Recommended Jobs, Company Jobs and Job History. */
export default function JobCard({ job, variant = 'default' }: { job: Job; variant?: JobCardVariant }) {
  const saved = useAppStore((s) => s.profile?.savedJobs?.includes(job.id) ?? false);
  const toggleSavedJob = useAppStore((s) => s.toggleSavedJob);
  const userId = useAppStore((s) => s.user?.id);
  const interviewTime = job.applicants?.find((a) => a.applicantId === userId)?.interviewTime;
  const Bookmark = saved ? IconBookmarkFilled : IconBookmark;

  return (
    <article
      data-aos="fade-up"
      className="flex w-72 flex-col gap-3 rounded-xl bg-mine-shaft-900 p-4 transition duration-300 ease-in-out hover:shadow-[0_0_5px_1px] hover:shadow-bright-sun-400 max-sm:w-full"
    >
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <div className="shrink-0 rounded-md bg-mine-shaft-800 p-2">
            <CompanyLogo name={job.company} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-semibold">{job.jobTitle}</div>
            <div className="text-xs text-mine-shaft-300">
              <Link className="hover:text-mine-shaft-200" href={`/company/${encodeURIComponent(job.company)}`}>
                {job.company}
              </Link>{' '}
              &bull; {job.applicants?.length ?? 0} Applicants
            </div>
          </div>
        </div>
        <button type="button" className="h-fit" aria-label={saved ? 'Remove from saved jobs' : 'Save job'} onClick={() => toggleSavedJob(job.id)}>
          <Bookmark className={saved ? 'text-bright-sun-400' : 'text-mine-shaft-300 hover:text-bright-sun-400'} stroke={1.5} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 [&>div]:rounded-lg [&>div]:bg-mine-shaft-800 [&>div]:p-2 [&>div]:py-1 [&>div]:text-xs [&>div]:text-bright-sun-400">
        <div>{job.experience}</div>
        <div>{job.jobType}</div>
        <div>{job.location}</div>
      </div>

      <Text className="text-justify text-xs! text-mine-shaft-300!" lineClamp={3}>
        {job.about}
      </Text>

      <Divider color="mineShaft.7" size="xs" />
      <div className="flex justify-between">
        <div className="font-semibold text-mine-shaft-200">&#8377;{job.packageOffered} LPA</div>
        <div className="flex items-center gap-1 text-xs text-mine-shaft-400">
          <IconClockHour3 className="h-5 w-5" stroke={1.5} />
          {TIME_LABEL[variant]} {timeAgo(job.postTime)}
        </div>
      </div>

      {(variant === 'offered' || variant === 'interviewing') && <Divider color="mineShaft.7" size="xs" />}
      {variant === 'offered' && (
        <div className="flex gap-2">
          <Button color="brightSun.4" variant="outline" fullWidth>
            Accept
          </Button>
          <Button color="brightSun.4" variant="light" fullWidth>
            Reject
          </Button>
        </div>
      )}
      {variant === 'interviewing' && (
        <div className="flex items-center gap-1 text-sm">
          <IconCalendarMonth className="h-5 w-5 text-bright-sun-400" stroke={1.5} />
          {interviewTime ? formatInterviewTime(interviewTime) : 'Interview being scheduled'}
        </div>
      )}

      <Button component={Link} href={`/jobs/${job.id}`} className="mt-auto" fullWidth color="brightSun.4" variant="light">
        View Job
      </Button>
    </article>
  );
}
