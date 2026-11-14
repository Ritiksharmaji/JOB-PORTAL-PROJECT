import type { Metadata } from 'next';
import JobHistoryView from '@/components/jobs/JobHistoryView';

export const metadata: Metadata = { title: 'Job History' };

export default function JobHistoryPage() {
  return <JobHistoryView />;
}
