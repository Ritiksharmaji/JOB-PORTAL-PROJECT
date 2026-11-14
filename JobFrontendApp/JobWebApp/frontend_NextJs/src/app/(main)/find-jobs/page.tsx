import type { Metadata } from 'next';
import FindJobsView from '@/components/jobs/FindJobsView';
import type { SearchFilter } from '@/types';

export const metadata: Metadata = { title: 'Find Jobs' };

const list = (v: string | string[] | undefined) => (v ? (Array.isArray(v) ? v : [v]) : []);

/** Query params pre-fill the filters, e.g. /find-jobs?jobTitle=Developer&jobType=Full%20Time */
export default async function FindJobsPage({ searchParams }: PageProps<'/find-jobs'>) {
  const sp = await searchParams;
  const initialFilter: SearchFilter = { jobTitle: list(sp.jobTitle), jobType: list(sp.jobType), location: list(sp.location) };
  return <FindJobsView initialFilter={initialFilter} />;
}
