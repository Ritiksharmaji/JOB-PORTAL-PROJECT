import type { Metadata } from 'next';
import TalentProfileView from '@/components/talent/TalentProfileView';

export const metadata: Metadata = { title: 'Talent Profile' };

export default async function TalentProfilePage({ params }: PageProps<'/talent-profile/[id]'>) {
  const { id } = await params;
  return <TalentProfileView id={id} />;
}
