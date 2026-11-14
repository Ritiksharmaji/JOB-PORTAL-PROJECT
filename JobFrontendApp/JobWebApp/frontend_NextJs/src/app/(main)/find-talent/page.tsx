import type { Metadata } from 'next';
import FindTalentView from '@/components/talent/FindTalentView';

export const metadata: Metadata = { title: 'Find Talent' };

export default function FindTalentPage() {
  return <FindTalentView />;
}
