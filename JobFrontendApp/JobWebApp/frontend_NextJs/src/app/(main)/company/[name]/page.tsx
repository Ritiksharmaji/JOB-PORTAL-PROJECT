import type { Metadata } from 'next';
import CompanyView from '@/components/jobs/CompanyView';

export async function generateMetadata({ params }: PageProps<'/company/[name]'>): Promise<Metadata> {
  const { name } = await params;
  return { title: decodeURIComponent(name) };
}

export default async function CompanyPage({ params }: PageProps<'/company/[name]'>) {
  const { name } = await params;
  return <CompanyView name={decodeURIComponent(name)} />;
}
