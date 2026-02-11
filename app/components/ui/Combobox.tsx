import {
  Combobox as HeadlessCombobox,
  ComboboxButton,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import { useState, useMemo, useRef, useEffect, type ReactNode } from 'react';

function FilterInput({
  query,
  setQuery,
  inputRef,
  open,
  filterable,
  placeholder = 'Filter options...',
}: {
  query: string;
  setQuery: (q: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  open: boolean;
  filterable: boolean;
  placeholder?: string;
}) {
  useEffect(() => {
    if (open && filterable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, filterable, inputRef]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={placeholder}
      className="w-full text-[16px] rounded border-0 px-8 bg-lightGrey px-2 py-1.5 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      autoComplete="off"
      aria-label="Filter options"
    />
  );
}

export interface ComboboxOptionItem<T> {
  value: T;
  label: string;
  mobileLabel?: string;
  disabled?: boolean;
}

export interface ComboboxProps<T> {
  /** Current selected value */
  value: T | null;
  /** Called when selection changes */
  onChange: (value: T | null) => void;
  /** Options to display. Use either options or items */
  options?: T[];
  /** Options with label (alternative to options + getOptionLabel) */
  items?: ComboboxOptionItem<T>[];
  /** Get display label for an option (used when using options prop) */
  getOptionLabel?: (option: T) => string;
  /** Compare two options for equality (optional, uses reference equality by default) */
  getOptionKey?: (option: T) => string | number;
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Optional filter - when provided, shows search input and filters options */
  filterable?: boolean;
  /** Filter function when filterable (default: case-insensitive includes) */
  filterOption?: (option: T, query: string) => boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom trigger (button) content. If not provided, shows selected label or placeholder */
  trigger?: ReactNode | ((value: T | null, open: boolean) => ReactNode);
  /** Class names */
  className?: string;
  buttonClassName?: string;
  optionsClassName?: string;
  optionClassName?: string;
  /** Accessibility label for the combobox */
  'aria-label'?: string;
  /** Optional comparator for value equality (Headless UI 'by' prop) */
  by?: (a: T, b: T) => boolean | keyof T & string;
}

function defaultFilter<T>(getLabel: (opt: T) => string) {
  return (option: T, query: string) =>
    getLabel(option).toLowerCase().includes(query.toLowerCase());
}

export function Combobox<T>({
  value,
  onChange,
  options,
  items,
  getOptionLabel,
  getOptionKey,
  placeholder = 'Select...',
  filterable = false,
  filterOption,
  disabled = false,
  trigger,
  className,
  buttonClassName,
  optionsClassName,
  optionClassName,
  'aria-label': ariaLabel = 'Choose an option',
  by,
}: ComboboxProps<T>) {
  const [query, setQuery] = useState('');
  const filterInputRef = useRef<HTMLInputElement>(null);

  const resolvedOptions: ComboboxOptionItem<T>[] = useMemo(() => {
    if (items) return items;
    if (!options) return [];
    const getLabel = getOptionLabel ?? ((x: T) => String(x));
    return options.map((opt) => ({
      value: opt,
      label: getLabel(opt),
    }));
  }, [items, options, getOptionLabel]);

  const getLabel = (opt: T) =>
    resolvedOptions.find((i) => i.value === opt)?.label ?? (getOptionLabel?.(opt) ?? String(opt));

  const filteredOptions = useMemo(() => {
    if (!filterable || !query.trim()) return resolvedOptions;
    const filterFn =
      filterOption ??
      defaultFilter(getLabel);
    return resolvedOptions.filter((item) => filterFn(item.value, query));
  }, [resolvedOptions, query, filterable, filterOption, getLabel]);

  const selectedItem = resolvedOptions.find(
    (i) => i.value === value || (getOptionKey && getOptionKey(i.value) === getOptionKey(value as T))
  );
  const displayValue = selectedItem?.label ?? (value != null ? getLabel(value) : null);
  const mobileDisplayValue =
    selectedItem?.mobileLabel ?? (value != null ? getLabel(value) : null);

  return (
    <HeadlessCombobox
      as="div"
      value={value}
      onChange={onChange}
      disabled={disabled}
      by={by as any}
      aria-label={ariaLabel}
      className={clsx('relative', className)}
      onClose={() => setQuery('')}
    >
        {({ open }) => (
        <>
          {trigger !== undefined ? (
            typeof trigger === 'function' ? (
              <ComboboxButton
                className={clsx(
                  'flex items-center justify-between gap-2 rounded-md border border-gray-300 bg-white py-2 text-left text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50',
                  buttonClassName
                )}
              >
                {trigger(value, open)}
              </ComboboxButton>
            ) : (
              <ComboboxButton
                className={clsx(
                  'flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white py-2 text-left text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50',
                  buttonClassName
                )}
              >
                {trigger}
              </ComboboxButton>
            )
          ) : (
            <ComboboxButton
              className={clsx(
                'flex flex-1 min-w-[70px] tablet:min-w-[160px] text-white text-medium-semi max-w-[250px] items-center justify-between gap-2 rounded-md bg-transparent py-2 text-left text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50',
                buttonClassName
              )}
            >
              <span className={clsx(!displayValue && !mobileDisplayValue && 'text-white')}>
                <span className="tablet:hidden align-bottom">
                  {mobileDisplayValue ?? displayValue ?? placeholder}
                </span>
                <span className="hidden tablet:inline align-bottom">
                  {displayValue ?? placeholder}
                </span>
              </span>
            </ComboboxButton>
          )}

          <ComboboxOptions
            anchor={false}
            modal={false}
            className={clsx(
              'absolute left-0 top-full z-50 mt-1 min-w-[250px] max-h-[300px] overflow-auto rounded-md border border-gray-300 bg-white shadow-lg empty:invisible',
              optionsClassName
            )}
          >
            {filterable && (
              <div
                className="sticky top-0 z-10 border-b border-gray-200 bg-white"
                onMouseDown={(e) => {
                  // Prevent panel from closing when clicking the filter (bubble to outside-click handler)
                  e.stopPropagation();
                }}
              >
                <FilterInput
                  query={query}
                  setQuery={setQuery}
                  inputRef={filterInputRef}
                  open={open}
                  filterable={filterable}
                  placeholder="Search currency..."
                />
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-12 py-12 text-sm text-small">No results</div>
            ) : (
              filteredOptions.map((item) => (
                <ComboboxOption
                  key={
                    getOptionKey
                      ? String(getOptionKey(item.value))
                      : JSON.stringify(item.value)
                  }
                  value={item.value}
                  disabled={item.disabled}
                  className={clsx(
                    'cursor-pointer px-8 py-8 text-[14px] font-semibold data-[focus]:bg-blue-100 data-[selected]:bg-lightGrey data-[selected]:font-bold',
                    optionClassName
                  )}
                >
                  {item.label}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </>
      )}
    </HeadlessCombobox>
  );
}
