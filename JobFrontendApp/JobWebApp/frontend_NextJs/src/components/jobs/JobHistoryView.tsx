'use client';

import { Divider, Tabs } from '@mantine/core';
import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { jobApi } from '@/lib/api/services';
import { useAppStore } from '@/store/app-store-provider';
import type { ApplicationStatus } from '@/types';
import JobCard, { type JobCardVariant } from './JobCard';

type HistoryTab = 'APPLIED' | 'SAVED' | 'OFFERED' | 'INTERVIEWING';

const TABS: { value: HistoryTab; label: string }[] = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SAVED', label: 'Saved' },
  { value: 'OFFERED', label: 'Offered' },
  { value: 'INTERVIEWING', label: 'In Progress' },
];

export const tabListClass =
  "mb-5 font-semibold [&_button]:text-xl! [&_button[data-active='true']]:border-b-mine-shaft-950! [&_button[data-active='true']]:text-bright-sun-400 max-sm:[&_button]:text-lg! max-xs:font-medium max-xs:[&_button]:px-1.5! max-xs:[&_button]:py-2! max-xs:[&_button]:text-base! max-xsm:[&_button]:text-sm!";

/** Applicant's applications grouped by status, plus saved jobs. */
export default function JobHistoryView() {
  const userId = useAppStore((s) => s.user?.id);
  const savedJobs = useAppStore((s) => s.profile?.savedJobs);
  const [tab, setTab] = useState<HistoryTab>('APPLIED');
  const { data: jobs } = useApi(() => jobApi.getAllJobs(), [], { overlay: true });

  const visible = (jobs ?? []).filter((job) =>
    tab === 'SAVED'
      ? savedJobs?.includes(job.id)
      : job.applicants?.some((a) => a.applicantId === userId && a.applicationStatus === (tab as ApplicationStatus)),
  );

  return (
    <div className="min-h-[90vh] bg-mine-shaft-950 px-4">
      <Divider />
      <section className="my-5">
        <h1 className="mb-5 text-2xl font-semibold">Job History</h1>
        <Tabs value={tab} onChange={(v) => setTab((v as HistoryTab) ?? 'APPLIED')} radius="lg" autoContrast variant="outline">
          <Tabs.List className={tabListClass}>
            {TABS.map((t) => (
              <Tabs.Tab key={t.value} value={t.value}>
                {t.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
        <div className="mt-10 flex flex-wrap gap-5">
          {visible.map((job) => (
            <JobCard key={job.id} job={job} variant={tab.toLowerCase() as JobCardVariant} />
          ))}
          {jobs && visible.length === 0 && <p className="text-lg font-medium">Nothing to show..</p>}
        </div>
      </section>
    </div>
  );
}
