import type { Metadata } from 'next';
import PostedJobsView from '@/components/posted-jobs/PostedJobsView';

export const metadata: Metadata = { title: 'Posted Jobs' };

/** `/posted-jobs/0` redirects to the newest active job once the list loads. */
export default async function PostedJobsPage({ params }: PageProps<'/posted-jobs/[id]'>) {
  const { id } = await params;
  return <PostedJobsView id={id} />;
}
