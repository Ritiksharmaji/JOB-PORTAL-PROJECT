'use client';

import { Button, Divider, Input } from '@mantine/core';
import { IconUserCircle, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import FilterBar from '@/components/shared/FilterBar';
import Sort, { TALENT_SORT_OPTIONS } from '@/components/shared/Sort';
import { TALENT_FILTER_FIELDS } from '@/data/options';
import { profileApi } from '@/lib/api/services';
import { hasActiveFilters } from '@/store/app-store';
import { useAppStore } from '@/store/app-store-provider';
import type { Profile, SearchFilter, SortOption } from '@/types';
import TalentCard from './TalentCard';

const EXP_RANGE = { key: 'exp', label: 'Experience (Year)', max: 50, format: ([a, b]: [number, number]) => `${a} - ${b}` } as const;

const matchesAny = (value: string | undefined, terms?: string[]) =>
  !terms?.length || terms.some((t) => value?.toLowerCase().includes(t.toLowerCase()));

function filterTalents(talents: Profile[], f: SearchFilter) {
  return talents.filter(
    (t) =>
      (!f.name || t.name?.toLowerCase().includes(f.name.toLowerCase())) &&
      matchesAny(t.jobTitle, f.jobTitle) &&
      matchesAny(t.location, f.location) &&
      (!f.skills?.length || f.skills.some((s) => t.skills?.some((ts) => ts.toLowerCase().includes(s.toLowerCase())))) &&
      (!f.exp || (f.exp[0] <= (t.totalExp ?? 0) && (t.totalExp ?? 0) <= f.exp[1])),
  );
}

function sortTalents(talents: Profile[], sort: SortOption) {
  const list = [...talents];
  if (sort === 'Experience: Low to High') return list.sort((a, b) => (a.totalExp ?? 0) - (b.totalExp ?? 0));
  if (sort === 'Experience: High to Low') return list.sort((a, b) => (b.totalExp ?? 0) - (a.totalExp ?? 0));
  return list;
}

export default function FindTalentView() {
  const filter = useAppStore((s) => s.filter);
  const sort = useAppStore((s) => s.sort);
  const setSort = useAppStore((s) => s.setSort);
  const updateFilter = useAppStore((s) => s.updateFilter);
  const resetFilter = useAppStore((s) => s.resetFilter);
  const track = useAppStore((s) => s.track);
  const [talents, setTalents] = useState<Profile[] | null>(null);

  useEffect(() => {
    resetFilter();
    setSort('Relevance');
    let active = true;
    track(profileApi.getAllProfiles())
      .then((list) => active && setTalents(list))
      .catch(() => active && setTalents([]));
    return () => {
      active = false;
    };
  }, [resetFilter, setSort, track]);

  const visible = useMemo(() => sortTalents(filterTalents(talents ?? [], filter), sort), [talents, filter, sort]);

  const nameSearch = (
    <>
      <div className="mr-2 rounded-full bg-mine-shaft-900 p-1 text-bright-sun-400">
        <IconUserCircle size={20} />
      </div>
      <Input
        value={filter.name ?? ''}
        onChange={(e) => updateFilter({ name: e.currentTarget.value })}
        className="[&_input]:placeholder-mine-shaft-300!"
        variant="unstyled"
        placeholder="Talent Name"
        aria-label="Talent name"
      />
    </>
  );

  return (
    <div className="min-h-[90vh] bg-mine-shaft-950">
      <Divider size="xs" mx="md" />
      <FilterBar fields={TALENT_FILTER_FIELDS} range={EXP_RANGE} leading={nameSearch} />
      <Divider size="xs" mx="md" />
      <section className="p-5">
        <div className="mt-5 flex flex-wrap justify-between gap-2">
          <h1 className="flex items-center gap-3 text-2xl font-semibold">
            Talents
            {hasActiveFilters(filter) && (
              <Button onClick={resetFilter} size="compact-sm" leftSection={<IconX stroke={1.5} size={20} />} variant="filled" color="brightSun.4" autoContrast>
                Clear Filters
              </Button>
            )}
          </h1>
          <Sort options={TALENT_SORT_OPTIONS} />
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-5">
          {visible.map((talent) => (
            <TalentCard key={talent.id} talent={talent} />
          ))}
          {talents && visible.length === 0 && <p className="text-lg font-medium">No talent found</p>}
        </div>
      </section>
    </div>
  );
}
