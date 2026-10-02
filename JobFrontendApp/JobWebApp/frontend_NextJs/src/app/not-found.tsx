import type { Metadata } from 'next';
import ErrorCard from '@/components/shared/ErrorCard';

export const metadata: Metadata = { title: 'Page Not Found' };

export default function NotFound() {
  return <ErrorCard code="404" title="Page Not Found" message="Sorry, the page you are looking for does not exist." />;
}
