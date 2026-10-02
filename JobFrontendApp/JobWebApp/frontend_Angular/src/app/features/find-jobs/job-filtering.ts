import { Job, SearchFilter, SortOption } from '../../core/models';

const matchesAny = (value: string | undefined, terms?: string[]) =>
  !terms?.length || terms.some((term) => value?.toLowerCase().includes(term.toLowerCase()));

/** Client-side job filtering (the backend returns every job). */
export function filterJobs(jobs: Job[], filter: SearchFilter): Job[] {
  return jobs.filter(
    (job) =>
      matchesAny(job.jobTitle, filter.jobTitle) &&
      matchesAny(job.location, filter.location) &&
      matchesAny(job.experience, filter.experience) &&
      matchesAny(job.jobType, filter.jobType) &&
      (!filter.salary || (filter.salary[0] <= job.packageOffered && job.packageOffered <= filter.salary[1])),
  );
}

/** Returns a sorted copy; "Relevance" keeps the API order. */
export function sortJobs(jobs: Job[], sort: SortOption): Job[] {
  const list = [...jobs];
  switch (sort) {
    case 'Most Recent':
      return list.sort((a, b) => new Date(b.postTime).getTime() - new Date(a.postTime).getTime());
    case 'Salary: Low to High':
      return list.sort((a, b) => a.packageOffered - b.packageOffered);
    case 'Salary: High to Low':
      return list.sort((a, b) => b.packageOffered - a.packageOffered);
    default:
      return list;
  }
}
