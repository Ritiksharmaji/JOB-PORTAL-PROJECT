import type { Metadata } from 'next';
import ApplyJobView from '@/components/jobs/ApplyJobView';

export const metadata: Metadata = { title: 'Apply' };

export default async function ApplyJobPage({ params }: PageProps<'/apply-job/[id]'>) {
  const { id } = await params;
  return <ApplyJobView id={id} />;
}
