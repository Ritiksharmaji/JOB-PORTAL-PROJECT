'use client';

import { ActionIcon, Button, Divider } from '@mantine/core';
import { IconBookmark, IconBookmarkFilled } from '@tabler/icons-react';
import DOMPurify from 'dompurify';
import Link from 'next/link';
import { useMemo } from 'react';
import CompanyLogo from '@/components/shared/CompanyLogo';
import { JOB_FACTS } from '@/data/options';
import { getErrorMessage } from '@/lib/api/client';
import { jobApi } from '@/lib/api/services';
import { errorNotification, successNotification } from '@/lib/notifications';
import { timeAgo } from '@/lib/utils/date';
import { useAppStore } from '@/store/app-store-provider';
import type { Job } from '@/types';

/**
 * Full job description. Applicants see Apply/Applied + bookmark; employers
 * (`editable`) see Edit/Reopen + Close.
 */
export default function JobDescription({ job, editable = false, onClosed }: { job: Job; editable?: boolean; onClosed?: () => void }) {
  const userId = useAppStore((s) => s.user?.id);
  const saved = useAppStore((s) => s.profile?.savedJobs?.includes(job.id) ?? false);
  const toggleSavedJob = useAppStore((s) => s.toggleSavedJob);
  const track = useAppStore((s) => s.track);

  const applied = !!job.applicants?.some((a) => a.applicantId === userId);
  const closed = job.jobStatus === 'CLOSED';
  // DOMPurify needs the DOM, so sanitise in the browser only (this is a client component).
  const cleanHtml = useMemo(() => (typeof window === 'undefined' ? '' : DOMPurify.sanitize(job.description ?? '')), [job.description]);
  const Bookmark = saved ? IconBookmarkFilled : IconBookmark;

  const closeJob = async () => {
    try {
      await track(jobApi.postJob({ ...job, jobStatus: 'CLOSED' }));
      successNotification('Job Closed', 'Job has been closed successfully');
      onClosed?.();
    } catch (err) {
      errorNotification('Error', getErrorMessage(err));
    }
  };

  return (
    <div data-aos="zoom-out">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex shrink-0 rounded-xl bg-mine-shaft-800 p-3">
            <CompanyLogo name={job.company} className="h-14 w-14 max-xs:h-10 max-xs:w-10" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold max-xs:text-xl">{job.jobTitle}</h1>
            <div className="flex flex-wrap gap-1 text-lg text-mine-shaft-300 max-xs:text-base">
              <span>{job.company} &bull;</span>
              <span>{timeAgo(job.postTime)} &bull;</span>
              <span>{job.applicants?.length ?? 0} Applicants</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 max-sm:w-full sm:flex-col">
          {editable ? (
            <>
              <Button component={Link} href={`/post-job/${job.id}`} color="brightSun.4" size="sm" variant="light">
                {closed ? 'Reopen' : 'Edit'}
              </Button>
              {!closed && (
                <Button onClick={closeJob} color="red.4" size="sm" variant="light">
                  Close
                </Button>
              )}
            </>
          ) : (
            <>
              {applied ? (
                <Button color="green.8" size="sm" variant="light">
                  Applied
                </Button>
              ) : (
                <Button component={Link} href={`/apply-job/${job.id}`} color="brightSun.4" size="sm" variant="light">
                  Apply
                </Button>
              )}
              <button type="button" aria-label={saved ? 'Remove from saved jobs' : 'Save job'} onClick={() => toggleSavedJob(job.id)}>
                <Bookmark className={saved ? 'text-bright-sun-400' : 'text-mine-shaft-300 hover:text-bright-sun-400'} stroke={1.5} />
              </button>
            </>
          )}
        </div>
      </div>

      <Divider size="xs" my="xl" />
      <div className="flex justify-between gap-4 max-sm:flex-wrap">
        {JOB_FACTS.map(({ key, name, icon: Icon }) => (
          <div key={key} className="flex flex-col items-center gap-1 text-sm">
            <ActionIcon className="h-12! w-12! max-xs:h-8! max-xs:w-8!" variant="light" color="brightSun.4" radius="xl" aria-hidden>
              <Icon className="h-4/5 w-4/5" />
            </ActionIcon>
            <div className="text-mine-shaft-300 max-xs:text-sm">{name}</div>
            <div className="text-base font-semibold max-xs:text-sm">
              {job[key]}
              {key === 'packageOffered' && ' LPA'}
            </div>
          </div>
        ))}
      </div>

      <Divider size="xs" my="xl" />
      <h2 className="mb-5 text-xl font-semibold">Required Skills</h2>
      <div className="flex flex-wrap gap-2">
        {job.skillsRequired?.map((skill) => (
          <span key={skill} className="rounded-full bg-bright-sun-400/10 px-3 py-1.5 text-sm font-medium text-bright-sun-400 max-xs:text-xs">
            {skill}
          </span>
        ))}
      </div>

      <Divider size="xs" my="xl" />
      <div className="rich-text" dangerouslySetInnerHTML={{ __html: cleanHtml }} />

      <Divider size="xs" my="xl" />
      <h2 className="mb-5 text-xl font-semibold">About Company</h2>
      <div className="mb-3 flex items-center justify-between max-xs:flex-wrap max-xs:gap-2">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-mine-shaft-800 p-3">
            <CompanyLogo name={job.company} className="h-8 w-8" />
          </div>
          <div>
            <div className="text-lg font-medium">{job.company}</div>
            <div className="text-mine-shaft-300">10k+ Employees</div>
          </div>
        </div>
        <Button component={Link} href={`/company/${encodeURIComponent(job.company)}`} color="brightSun.4" variant="light">
          Company Page
        </Button>
      </div>
      <p className="text-justify text-mine-shaft-300 max-xs:text-sm">
        {job.company} is a fast-growing organisation building products used by millions of people. The team values
        ownership, curiosity and craftsmanship, and offers an environment where you can learn new technologies, work on
        meaningful problems and grow your career alongside talented colleagues.
      </p>
    </div>
  );
}
