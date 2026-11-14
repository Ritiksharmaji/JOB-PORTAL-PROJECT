'use client';

import { ActionIcon, Combobox, useCombobox } from '@mantine/core';
import { IconAdjustments } from '@tabler/icons-react';
import { useAppStore } from '@/store/app-store-provider';
import type { SortOption } from '@/types';

export const JOB_SORT_OPTIONS: SortOption[] = ['Relevance', 'Most Recent', 'Salary: Low to High', 'Salary: High to Low'];
export const TALENT_SORT_OPTIONS: SortOption[] = ['Relevance', 'Experience: Low to High', 'Experience: High to Low'];

/** Sort dropdown bound to the store. (React: FindJobs/Sort.) */
export default function Sort({ options = JOB_SORT_OPTIONS }: { options?: SortOption[] }) {
  const sort = useAppStore((s) => s.sort);
  const setSort = useAppStore((s) => s.setSort);
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });

  return (
    <Combobox
      store={combobox}
      width={160}
      position="bottom-start"
      onOptionSubmit={(val) => {
        setSort(val as SortOption);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <button
          type="button"
          onClick={() => combobox.toggleDropdown()}
          className="flex items-center rounded-xl border border-bright-sun-400 px-2 py-1 pr-1 text-sm hover:bg-mine-shaft-900 max-xs:px-1 max-xs:py-0 max-xs:text-xs max-xsm:mt-2"
        >
          {sort}
          <ActionIcon component="span" color="brightSun.4" variant="transparent" aria-hidden>
            <IconAdjustments style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
        </button>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {options.map((item) => (
            <Combobox.Option className="text-xs!" value={item} key={item}>
              {item}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
