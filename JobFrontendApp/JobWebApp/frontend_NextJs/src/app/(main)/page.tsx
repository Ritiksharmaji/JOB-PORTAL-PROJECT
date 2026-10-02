import Companies from '@/components/landing/Companies';
import DreamJob from '@/components/landing/DreamJob';
import JobCategory from '@/components/landing/JobCategory';
import Subscribe from '@/components/landing/Subscribe';
import Testimonials from '@/components/landing/Testimonials';
import Working from '@/components/landing/Working';

export default function HomePage() {
  return (
    <div className="min-h-[90vh] bg-mine-shaft-950">
      <DreamJob />
      <Companies />
      <JobCategory />
      <Working />
      <Testimonials />
      <Subscribe />
    </div>
  );
}
