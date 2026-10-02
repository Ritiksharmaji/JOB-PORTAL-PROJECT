'use client';

import { Combobox, InputBase, ScrollArea, useCombobox } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { useState } from 'react';

interface SelectInputProps {
  label: string;
  placeholder?: string;
  options: string[];
  leftSection?: Icon;
  /** Works with Mantine form: `{...form.getInputProps('company')}`. */
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: React.ReactNode;
  withAsterisk?: boolean;
}

/**
 * Searchable select that also lets the user create a new option.
 * (React app: PostJob/SelectInput + Profile/SelectInput, merged into one controlled component.)
 */
export default function SelectInput({ label, placeholder, options, leftSection: LeftIcon, value = '', onChange, onBlur, error, withAsterisk = true }: SelectInputProps) {
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });
  const [created, setCreated] = useState<string[]>([]);
  const [search, setSearch] = useState(value);

  // Keep the text in sync when the form value changes from outside (e.g. editing a loaded job).
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setSearch(value);
  }

  const data = [...options, ...created, ...(value && !options.includes(value) && !created.includes(value) ? [value] : [])];
  const exactMatch = data.includes(search);
  const filtered = exactMatch ? data : data.filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()));

  const select = (val: string) => {
    if (val === '$create') {
      const item = search.trim();
      setCreated((c) => [...c, item]);
      onChange?.(item);
      setSearch(item);
    } else {
      onChange?.(val);
      setSearch(val);
    }
    combobox.closeDropdown();
  };

  return (
    <Combobox store={combobox} withinPortal={false} onOptionSubmit={select}>
      <Combobox.Target>
        <InputBase
          label={label}
          withAsterisk={withAsterisk}
          error={error}
          leftSection={LeftIcon ? <LeftIcon stroke={1.5} /> : undefined}
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          value={search}
          placeholder={placeholder}
          onChange={(e) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(e.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(value);
            onBlur?.();
          }}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          <ScrollArea.Autosize mah={200} type="scroll">
            {filtered.map((item) => (
              <Combobox.Option value={item} key={item}>
                {item}
              </Combobox.Option>
            ))}
            {!exactMatch && search.trim().length > 0 && <Combobox.Option value="$create">+ Create {search}</Combobox.Option>}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
