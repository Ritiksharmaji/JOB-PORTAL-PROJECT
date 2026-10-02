import { Job } from '../../core/models';
import { filterJobs, sortJobs } from './job-filtering';

const job = (overrides: Partial<Job>): Job => ({
  id: 1,
  jobTitle: 'Developer',
  company: 'Google',
  about: '',
  experience: 'Intermediate',
  jobType: 'Full Time',
  location: 'Delhi',
  packageOffered: 10,
  postTime: '2026-01-01T00:00:00.000Z',
  description: '',
  skillsRequired: [],
  jobStatus: 'ACTIVE',
  postedBy: 1,
  ...overrides,
});

describe('job filtering', () => {
  const jobs = [
    job({ id: 1, jobTitle: 'Frontend Developer', location: 'London', packageOffered: 40, postTime: '2026-01-03T00:00:00Z' }),
    job({ id: 2, jobTitle: 'Designer', location: 'Berlin', packageOffered: 8, postTime: '2026-01-05T00:00:00Z' }),
    job({ id: 3, jobTitle: 'Backend Developer', location: 'London', packageOffered: 120, postTime: '2026-01-01T00:00:00Z' }),
  ];

  it('matches multi-select filters case-insensitively by substring', () => {
    expect(filterJobs(jobs, { jobTitle: ['developer'] }).map((j) => j.id)).toEqual([1, 3]);
    expect(filterJobs(jobs, { jobTitle: ['developer'], location: ['berlin'] })).toEqual([]);
  });

  it('applies the salary range inclusively', () => {
    expect(filterJobs(jobs, { salary: [8, 40] }).map((j) => j.id)).toEqual([1, 2]);
  });

  it('ignores empty filter lists', () => {
    expect(filterJobs(jobs, { location: [] })).toHaveLength(3);
  });

  it('sorts without mutating the input', () => {
    expect(sortJobs(jobs, 'Salary: High to Low').map((j) => j.id)).toEqual([3, 1, 2]);
    expect(sortJobs(jobs, 'Most Recent').map((j) => j.id)).toEqual([2, 1, 3]);
    expect(sortJobs(jobs, 'Relevance').map((j) => j.id)).toEqual([1, 2, 3]);
    expect(jobs.map((j) => j.id)).toEqual([1, 2, 3]);
  });
});
