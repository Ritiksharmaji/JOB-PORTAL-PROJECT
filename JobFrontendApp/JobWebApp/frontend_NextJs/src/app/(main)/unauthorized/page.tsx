import type { Metadata } from 'next';
import ErrorCard from '@/components/shared/ErrorCard';

export const metadata: Metadata = { title: 'Unauthorized' };

export default function UnauthorizedPage() {
  return <ErrorCard code="403" title="Unauthorized Access" message="Sorry, you don’t have permission to view this page." />;
}
