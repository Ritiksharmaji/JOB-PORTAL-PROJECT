import type { Metadata } from 'next';
import PostJobView from '@/components/posted-jobs/PostJobView';

export const metadata: Metadata = { title: 'Post Job' };

/** `/post-job/0` creates a job; any other id edits that job. */
export default async function PostJobPage({ params }: PageProps<'/post-job/[id]'>) {
  const { id } = await params;
  return <PostJobView id={id} />;
}
