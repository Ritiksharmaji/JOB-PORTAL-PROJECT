'use client';

import { Checkbox, Combobox, Group, Input, Pill, PillsInput, ScrollArea, useCombobox } from '@mantine/core';
import { IconSelector } from '@tabler/icons-react';
import { useState } from 'react';
import type { FilterField } from '@/data/options';
import { useAppStore } from '@/store/app-store-provider';

/** Multi-select checkbox dropdown bound to one key of the filter store. (React: FindJobs/MultiInput.) */
export default function MultiInput({ field }: { field: FilterField }) {
  const { key, title, icon: Icon, options } = field;
  const selected = useAppStore((s) => s.filter[key]) ?? [];
  const updateFilter = useAppStore((s) => s.updateFilter);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });
  const [search, setSearch] = useState('');
  const [created, setCreated] = useState<string[]>([]);

  const data = [...options, ...created];
  const exactMatch = data.includes(search.trim());
  const visible = data.filter((item) => item.toLowerCase().includes(search.trim().toLowerCase()));

  const toggle = (val: string) =>
    updateFilter({ [key]: selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val] });

  const handleSelect = (val: string) => {
    setSearch('');
    if (val === '$create') {
      const item = search.trim();
      setCreated((c) => [...c, item]);
      updateFilter({ [key]: [...selected, item] });
    } else {
      toggle(val);
    }
  };

  return (
    <Combobox store={combobox} onOptionSubmit={handleSelect} withinPortal={false}>
      <Combobox.DropdownTarget>
        <PillsInput
          variant="unstyled"
          size="sm"
          pointer
          onClick={() => combobox.toggleDropdown()}
          aria-label={`${title} filter`}
          leftSection={
            <div className="mr-2 rounded-full bg-mine-shaft-900 p-1 text-bright-sun-400">
              <Icon size={20} />
            </div>
          }
          rightSection={<IconSelector />}
        >
          <Pill.Group>
            {selected.length > 0 ? (
              <>
                <Pill withRemoveButton onRemove={() => toggle(selected[0])}>
                  {selected[0].length >= 10 ? `${selected[0].substring(0, 8)}..` : selected[0]}
                </Pill>
                {selected.length > 1 && <Pill>+{selected.length - 1} more</Pill>}
              </>
            ) : (
              <Input.Placeholder className="text-mine-shaft-300!">{title}</Input.Placeholder>
            )}
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown className="overflow-hidden">
        <Combobox.Search
          className="w-full [&_input]:px-2!"
          variant="unstyled"
          placeholder="Search"
          value={search}
          onChange={(e) => {
            combobox.updateSelectedOptionIndex();
            setSearch(e.currentTarget.value);
          }}
        />
        <Combobox.Options>
          <ScrollArea.Autosize mah={200} type="scroll">
            {visible.map((item, index) => (
              <Combobox.Option
                value={item}
                key={item}
                active={selected.includes(item)}
                className="animate-option opacity-0"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <Group gap="sm">
                  <Checkbox size="xs" color="brightSun.4" checked={selected.includes(item)} onChange={() => {}} aria-hidden tabIndex={-1} style={{ pointerEvents: 'none' }} />
                  <span className="text-mine-shaft-300">{item}</span>
                </Group>
              </Combobox.Option>
            ))}
            {!exactMatch && search.trim().length > 0 && <Combobox.Option value="$create">+ {search}</Combobox.Option>}
            {visible.length === 0 && exactMatch && <Combobox.Empty>Nothing found</Combobox.Empty>}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
