'use client';

import { Button, Divider } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import FilterBar from '@/components/shared/FilterBar';
import Sort, { JOB_SORT_OPTIONS } from '@/components/shared/Sort';
import { JOB_FILTER_FIELDS } from '@/data/options';
import { jobApi } from '@/lib/api/services';
import { filterJobs, sortJobs } from '@/lib/utils/job-filtering';
import { hasActiveFilters } from '@/store/app-store';
import { useAppStore } from '@/store/app-store-provider';
import type { Job, SearchFilter } from '@/types';
import JobCard from './JobCard';

const SALARY_RANGE = { key: 'salary', label: 'Salary', max: 300, format: ([a, b]: [number, number]) => `₹${a} LPA - ₹${b} LPA` } as const;

/** `initialFilter` comes from the URL (?jobTitle=…&jobType=…), e.g. the home page search. */
export default function FindJobsView({ initialFilter }: { initialFilter: SearchFilter }) {
  const filter = useAppStore((s) => s.filter);
  const sort = useAppStore((s) => s.sort);
  const setSort = useAppStore((s) => s.setSort);
  const resetFilter = useAppStore((s) => s.resetFilter);
  const updateFilter = useAppStore((s) => s.updateFilter);
  const track = useAppStore((s) => s.track);
  const [jobs, setJobs] = useState<Job[] | null>(null);

  const initialKey = JSON.stringify(initialFilter);
  useEffect(() => {
    resetFilter();
    updateFilter(JSON.parse(initialKey) as SearchFilter);
  }, [initialKey, resetFilter, updateFilter]);

  useEffect(() => {
    setSort('Relevance');
    let active = true;
    track(jobApi.getAllJobs())
      .then((list) => active && setJobs(list.filter((j) => j.jobStatus === 'ACTIVE')))
      .catch(() => active && setJobs([]));
    return () => {
      active = false;
    };
  }, [setSort, track]);

  const visible = useMemo(() => sortJobs(filterJobs(jobs ?? [], filter), sort), [jobs, filter, sort]);

  return (
    <div className="min-h-[90vh] bg-mine-shaft-950">
      <Divider size="xs" mx="md" />
      <FilterBar fields={JOB_FILTER_FIELDS} range={SALARY_RANGE} />
      <Divider size="xs" mx="md" />
      <section className="p-5">
        <div className="mt-5 flex flex-wrap justify-between gap-2">
          <h1 className="flex items-center gap-3 text-2xl font-semibold max-xs:text-xl">
            Recommended jobs
            {hasActiveFilters(filter) && (
              <Button onClick={resetFilter} size="compact-sm" leftSection={<IconX stroke={1.5} size={20} />} variant="filled" color="brightSun.4" autoContrast>
                Clear Filters
              </Button>
            )}
          </h1>
          <Sort options={JOB_SORT_OPTIONS} />
        </div>
        <div className="mt-10 flex flex-wrap gap-5">
          {visible.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {jobs && visible.length === 0 && <p className="text-lg font-medium">No job found</p>}
        </div>
      </section>
    </div>
  );
}
