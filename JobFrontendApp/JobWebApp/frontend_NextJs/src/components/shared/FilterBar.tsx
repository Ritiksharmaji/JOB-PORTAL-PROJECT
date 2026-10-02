'use client';

import { Button, Collapse, Divider, RangeSlider } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Fragment, useState, type ReactNode } from 'react';
import type { FilterField } from '@/data/options';
import { useAppStore } from '@/store/app-store-provider';
import MultiInput from './MultiInput';

interface FilterBarProps {
  fields: FilterField[];
  /** Range filter: salary (jobs) or experience (talent). */
  range: { key: 'salary' | 'exp'; label: string; max: number; format: (v: [number, number]) => string };
  /** Extra leading input (talent name search). */
  leading?: ReactNode;
}

const cell = 'w-1/5 max-lg:w-1/4 max-bs:w-[30%] max-sm:w-[48%] max-xs:mb-1 max-xs:w-full';

/** Shared search bar for Find Jobs and Find Talent. Collapsible on phones. */
export default function FilterBar({ fields, range, leading }: FilterBarProps) {
  const isPhone = useMediaQuery('(max-width: 475px)');
  const [opened, { toggle }] = useDisclosure(false);
  const stored = useAppStore((s) => s.filter[range.key]);
  const updateFilter = useAppStore((s) => s.updateFilter);
  const [dragValue, setDragValue] = useState<[number, number] | null>(null);
  // While dragging show the local value; otherwise mirror the store (so "Clear Filters" resets it).
  const value = dragValue ?? stored ?? [0, range.max];

  return (
    <div>
      <div className="flex justify-end">
        {isPhone && (
          <Button onClick={toggle} m="sm" radius="lg" variant="outline" color="brightSun.4" autoContrast>
            {opened ? 'Close' : 'Filters'}
          </Button>
        )}
      </div>
      <Collapse in={opened || !isPhone}>
        <div className="flex items-center px-5 py-8 text-mine-shaft-100 max-lg:flex-wrap">
          {leading && (
            <>
              <div className={`${cell} flex items-center`}>{leading}</div>
              <Divider className="max-sm:hidden" mr="xs" size="xs" orientation="vertical" />
            </>
          )}
          {fields.map((field) => (
            <Fragment key={field.key}>
              <div className={cell}>
                <MultiInput field={field} />
              </div>
              <Divider className="max-sm:hidden" mr="xs" size="xs" orientation="vertical" />
            </Fragment>
          ))}
          <div className={`${cell} text-sm text-mine-shaft-300 max-lg:mt-7 [&_.mantine-Slider-label]:translate-y-10!`}>
            <div className="mb-1 flex justify-between">
              <div>{range.label}</div>
              <div>{range.format(value)}</div>
            </div>
            <RangeSlider
              color="brightSun.4"
              size="xs"
              max={range.max}
              value={value}
              onChange={setDragValue}
              onChangeEnd={(v) => {
                updateFilter({ [range.key]: v });
                setDragValue(null);
              }}
            />
          </div>
        </div>
      </Collapse>
    </div>
  );
}
