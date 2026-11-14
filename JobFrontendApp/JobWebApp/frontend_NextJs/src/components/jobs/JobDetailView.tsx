'use client';

import { Divider } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BackButton from '@/components/shared/BackButton';
import { useApi } from '@/hooks/useApi';
import { jobApi } from '@/lib/api/services';
import JobCard from './JobCard';
import JobDescription from './JobDescription';

export default function JobDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { data: job, error, loading } = useApi(() => jobApi.getJob(id), [id], { overlay: true });
  const { data: allJobs } = useApi(() => jobApi.getAllJobs(), []);

  // Closed jobs can't be viewed by applicants.
  useEffect(() => {
    if (job?.jobStatus === 'CLOSED') router.replace('/find-jobs');
  }, [job, router]);

  const recommended = (allJobs ?? []).filter((j) => j.jobStatus === 'ACTIVE' && String(j.id) !== id).slice(0, 6);

  return (
    <div className="min-h-[90vh] bg-mine-shaft-950 p-4">
      <Divider size="xs" />
      <BackButton href="/find-jobs" />
      <div className="flex justify-around gap-5 max-bs:flex-wrap">
        <div className="w-2/3 max-bs:w-full">
          {job && <JobDescription job={job} />}
          {!loading && (error || !job) && <p className="py-20 text-center text-2xl font-semibold">Job Not Found.</p>}
        </div>
        <aside>
          <h2 className="mb-5 text-xl font-semibold">Recommended Job</h2>
          <div className="flex flex-wrap justify-between gap-5 bs:flex-col max-bs:justify-start">
            {recommended.map((rec) => (
              <JobCard key={rec.id} job={rec} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
