import type { Metadata } from 'next';
import JobDetailView from '@/components/jobs/JobDetailView';

export const metadata: Metadata = { title: 'Job Details' };

export default async function JobPage({ params }: PageProps<'/jobs/[id]'>) {
  const { id } = await params;
  return <JobDetailView id={id} />;
}
