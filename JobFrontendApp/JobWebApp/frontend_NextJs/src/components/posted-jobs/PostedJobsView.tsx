'use client';

import { Badge, Button, Divider, Drawer, Tabs } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import JobDescription from '@/components/jobs/JobDescription';
import { tabListClass } from '@/components/jobs/JobHistoryView';
import TalentCard, { type TalentCardMode } from '@/components/talent/TalentCard';
import { useApi } from '@/hooks/useApi';
import { jobApi } from '@/lib/api/services';
import { timeAgo } from '@/lib/utils/date';
import { useAppStore } from '@/store/app-store-provider';
import type { ApplicationStatus, Job, JobStatus } from '@/types';

const STATUS_LABEL: Record<JobStatus, string> = { ACTIVE: 'Posted', DRAFT: 'Drafted', CLOSED: 'Closed' };

/** Sidebar list of the employer's jobs grouped by status. */
function PostedJobList({ jobs, selected, onPick }: { jobs: Job[]; selected: Job | null; onPick?: () => void }) {
  const [status, setStatus] = useState<string>(selected?.jobStatus ?? 'ACTIVE');
  // Open the tab that contains the selected job (adjusting state during render, per React docs).
  const [lastSelected, setLastSelected] = useState(selected?.id);
  if (selected?.id !== lastSelected) {
    setLastSelected(selected?.id);
    setStatus(selected?.jobStatus ?? 'ACTIVE');
  }
  const count = (s: JobStatus) => jobs.filter((j) => j.jobStatus === s).length;
  const visible = jobs
    .filter((j) => j.jobStatus === status)
    .sort((a, b) => new Date(b.postTime).getTime() - new Date(a.postTime).getTime());

  return (
    <div>
      <h2 className="mb-5 text-2xl font-semibold">Jobs</h2>
      <Tabs variant="pills" autoContrast value={status} onChange={(v) => setStatus(v ?? 'ACTIVE')}>
        <Tabs.List className="font-medium [&_button[aria-selected='false']]:bg-mine-shaft-900">
          <Tabs.Tab value="ACTIVE">Active [{count('ACTIVE')}]</Tabs.Tab>
          <Tabs.Tab value="DRAFT">Drafts [{count('DRAFT')}]</Tabs.Tab>
          <Tabs.Tab value="CLOSED">Closed [{count('CLOSED')}]</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <div className="mt-5 flex flex-col gap-5">
        {visible.map((job) => (
          <Link
            key={job.id}
            href={`/posted-jobs/${job.id}`}
            onClick={onPick}
            className={`w-52 rounded-xl border-l-2 border-l-bright-sun-400 p-2 hover:opacity-80 max-lg:w-48 max-bs:w-44 ${
              job.id === selected?.id ? 'bg-bright-sun-400 text-black' : 'bg-mine-shaft-900 text-mine-shaft-300'
            }`}
          >
            <div className="text-sm font-semibold">{job.jobTitle}</div>
            <div className="text-xs font-medium">{job.location}</div>
            <div className="text-xs">
              {STATUS_LABEL[job.jobStatus]} {timeAgo(job.postTime)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const PIPELINE: Record<string, { status: ApplicationStatus; mode: TalentCardMode; empty: string }> = {
  applicants: { status: 'APPLIED', mode: 'posted', empty: 'No Applicants Yet' },
  invited: { status: 'INTERVIEWING', mode: 'invited', empty: 'No Applicants Invited Yet' },
  offered: { status: 'OFFERED', mode: 'offered', empty: 'No Applicants Offered Yet' },
  rejected: { status: 'REJECTED', mode: 'offered', empty: 'No Applicants Rejected Yet' },
};

/** Selected job with its applicant pipeline. */
function PostedJobDetail({ job, onChange }: { job: Job | null; onChange: () => void }) {
  const [tab, setTab] = useState('overview');
  const [lastJobId, setLastJobId] = useState(job?.id);
  if (job?.id !== lastJobId) {
    setLastJobId(job?.id);
    setTab('overview');
  }
  if (!job) return <p className="flex min-h-[70vh] items-center justify-center text-2xl font-semibold">Job Not Found.</p>;
  const config = PIPELINE[tab];
  const applicants = config ? (job.applicants ?? []).filter((a) => a.applicationStatus === config.status) : [];

  return (
    <div data-aos="zoom-out">
      <h1 className="flex items-center text-2xl font-semibold max-xs:text-xl">
        {job.jobTitle}
        <Badge variant="light" ml="sm" color="brightSun.4" size="sm">
          {job.jobStatus}
        </Badge>
      </h1>
      <div className="mb-5 font-medium text-mine-shaft-300 max-xs:text-sm">{job.location}</div>
      <Tabs value={tab} onChange={(v) => setTab(v ?? 'overview')} radius="lg" autoContrast variant="outline">
        <Tabs.List className={tabListClass}>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="applicants">Applicants</Tabs.Tab>
          <Tabs.Tab value="invited">Invited</Tabs.Tab>
          <Tabs.Tab value="offered">Offered</Tabs.Tab>
          <Tabs.Tab value="rejected">Rejected</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      {config ? (
        <div className="mt-10 flex flex-wrap justify-around gap-5">
          {applicants.map((a) => (
            <TalentCard key={a.applicantId} talent={a} mode={config.mode} jobId={job.id} onStatusChange={onChange} />
          ))}
          {applicants.length === 0 && <p>{config.empty}</p>}
        </div>
      ) : (
        <JobDescription job={job} editable onClosed={onChange} />
      )}
    </div>
  );
}

/** Employer dashboard. `/posted-jobs/0` opens the newest active job. */
export default function PostedJobsView({ id }: { id: string }) {
  const router = useRouter();
  const userId = useAppStore((s) => s.user?.id);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [drawerOpen, drawer] = useDisclosure(false);
  const { data: jobs, reload } = useApi(() => (userId ? jobApi.getJobsPostedBy(userId) : Promise.resolve([])), [userId], { overlay: true });

  useEffect(() => {
    if (Number(id) !== 0 || !jobs?.length) return;
    const first = jobs.find((j) => j.jobStatus === 'ACTIVE') ?? jobs[0];
    router.replace(`/posted-jobs/${first.id}`);
  }, [id, jobs, router]);

  const list = jobs ?? [];
  const selected = list.find((j) => String(j.id) === id) ?? null;

  return (
    <div className="min-h-[90vh] bg-mine-shaft-950 px-5">
      <Divider />
      {isMobile && (
        <Button my="xs" size="sm" autoContrast onClick={drawer.open}>
          All Jobs
        </Button>
      )}
      <Drawer opened={drawerOpen} size={250} overlayProps={{ backgroundOpacity: 0.5, blur: 4 }} onClose={drawer.close} title="All Jobs">
        <PostedJobList jobs={list} selected={selected} onPick={drawer.close} />
      </Drawer>
      <div className="flex justify-around gap-5 py-5">
        {!isMobile && (
          <div className="w-1/5">
            <PostedJobList jobs={list} selected={selected} />
          </div>
        )}
        <div className="w-3/4 px-5 max-md:w-full max-md:p-0">{jobs && <PostedJobDetail job={selected} onChange={reload} />}</div>
      </div>
    </div>
  );
}
