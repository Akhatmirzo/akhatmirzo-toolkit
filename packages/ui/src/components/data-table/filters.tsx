import { useId, type ReactNode } from 'react';
import { Badge } from '../badge';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { DatePicker } from '../date-picker';
import { Input } from '../input';
import { Popover } from '../popover';
import { Radio, RadioGroup } from '../radio-group';
import { FilterIcon } from './icons';
import type {
  DataTableColumn,
  DataTableDateRangeValue,
  DataTableFilterOption,
  DataTableFilterValue,
  DataTableLabels,
  DataTableRangeValue,
} from './types';
import { columnLabel, describeFilter, isEmptyFilter } from './utils';

type ResolvedOption = DataTableFilterOption & { count?: number };

export interface FilterColumn<T> {
  column: DataTableColumn<T>;
  options: ResolvedOption[];
}

interface FiltersProps<T> {
  columns: FilterColumn<T>[];
  filters: Record<string, DataTableFilterValue>;
  onFilterChange: (id: string, value: DataTableFilterValue | undefined) => void;
  onClear: () => void;
  labels: Required<DataTableLabels>;
}

function Count({ value }: { value?: number }) {
  if (value === undefined) return null;
  return <span className="ml-auto pl-3 text-xs text-text-muted tabular-nums">{value}</span>;
}

function OptionLabel({ label, count }: { label: ReactNode; count?: number }) {
  return (
    <span className="flex min-w-0 flex-1 items-center">
      <span className="truncate">{label}</span>
      <Count value={count} />
    </span>
  );
}

function FilterControl<T>({
  item,
  value,
  onChange,
  labels,
  labelId,
}: {
  item: FilterColumn<T>;
  value: DataTableFilterValue | undefined;
  onChange: (value: DataTableFilterValue | undefined) => void;
  labels: Required<DataTableLabels>;
  labelId: string;
}) {
  const { column, options } = item;
  const label = columnLabel(column);

  switch (column.filter) {
    case 'select':
      return (
        <RadioGroup
          aria-labelledby={labelId}
          size="sm"
          value={typeof value === 'string' ? value : ''}
          onValueChange={(v) => onChange(v || undefined)}
          className="gap-2"
        >
          <Radio value="" label={labels.all} className="w-full [&>span:last-child]:flex-1" />
          {options.map((o) => (
            <Radio
              key={o.value}
              value={o.value}
              label={<OptionLabel label={o.label} count={o.count} />}
              className="w-full [&>span:last-child]:flex-1"
            />
          ))}
        </RadioGroup>
      );
    case 'multiselect': {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
          {options.map((o) => (
            <Checkbox
              key={o.value}
              size="sm"
              checked={selected.includes(o.value)}
              onCheckedChange={(checked) =>
                onChange(checked ? [...selected, o.value] : selected.filter((v) => v !== o.value))
              }
              label={<OptionLabel label={o.label} count={o.count} />}
              className="w-full [&>span:last-child]:flex-1 [&>span:last-child>span]:w-full"
            />
          ))}
        </div>
      );
    }
    case 'range': {
      const range = (value ?? {}) as DataTableRangeValue;
      const set = (key: 'min' | 'max', raw: string) => {
        const n = raw.trim() === '' ? undefined : Number(raw);
        onChange({ ...range, [key]: Number.isFinite(n) ? n : undefined });
      };
      return (
        <div role="group" aria-labelledby={labelId} className="grid grid-cols-2 gap-2">
          <Input
            size="sm"
            type="number"
            inputMode="decimal"
            aria-label={`${label} ${labels.min}`}
            placeholder={labels.min}
            value={range.min ?? ''}
            onChange={(e) => set('min', e.target.value)}
          />
          <Input
            size="sm"
            type="number"
            inputMode="decimal"
            aria-label={`${label} ${labels.max}`}
            placeholder={labels.max}
            value={range.max ?? ''}
            onChange={(e) => set('max', e.target.value)}
          />
        </div>
      );
    }
    case 'date': {
      const range = (value ?? {}) as DataTableDateRangeValue;
      // Ikki DatePicker yonma-yon 296px'ga sig'maydi — ustma-ust
      return (
        <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
          <DatePicker
            size="sm"
            clearable
            aria-label={`${label}: ${labels.from}`}
            value={range.from ?? null}
            maxDate={range.to ?? undefined}
            onValueChange={(from) => onChange({ ...range, from })}
          />
          <DatePicker
            size="sm"
            clearable
            aria-label={`${label}: ${labels.to}`}
            value={range.to ?? null}
            minDate={range.from ?? undefined}
            onValueChange={(to) => onChange({ ...range, to })}
          />
        </div>
      );
    }
    default:
      return null;
  }
}

/** "Filtrlar" tugmasi + Popover */
export function DataTableFilterPopover<T>({
  columns,
  filters,
  onFilterChange,
  onClear,
  labels,
}: FiltersProps<T>) {
  const baseId = useId();
  const active = columns.filter(({ column }) => !isEmptyFilter(filters[column.key])).length;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          leftIcon={<FilterIcon />}
          data-slot="data-table-filter-trigger"
          aria-label={active ? `${labels.filters} (${active})` : undefined}
        >
          {labels.filters}
          {active > 0 && (
            <Badge variant="solid" color="primary" size="sm" className="-mr-1 tabular-nums">
              {active}
            </Badge>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        className="flex w-80 flex-col gap-4 p-3"
        aria-label={labels.filters}
      >
        {columns.map((item) => {
          const labelId = `${baseId}-${item.column.key}`;
          return (
            <div key={item.column.key} className="flex flex-col gap-2">
              <p id={labelId} className="text-xs font-medium text-text-muted">
                {columnLabel(item.column)}
              </p>
              <FilterControl
                item={item}
                value={filters[item.column.key]}
                onChange={(v) => onFilterChange(item.column.key, v)}
                labels={labels}
                labelId={labelId}
              />
            </div>
          );
        })}
        {active > 0 && (
          <Button variant="ghost" size="sm" className="self-end" onClick={onClear}>
            {labels.clearFilters}
          </Button>
        )}
      </Popover.Content>
    </Popover>
  );
}

/** Faol filtrlar — ✕ bilan o'chiriladigan Badge'lar */
export function DataTableFilterChips<T>({
  columns,
  filters,
  onFilterChange,
  labels,
}: Omit<FiltersProps<T>, 'onClear'>) {
  const chips = columns.filter(({ column }) => !isEmptyFilter(filters[column.key]));
  if (!chips.length) return null;
  return (
    <>
      {chips.map(({ column, options }) => {
        const text = describeFilter(column, filters[column.key] as DataTableFilterValue, options);
        return (
          <Badge
            key={column.key}
            color="primary"
            className="max-w-64"
            data-slot="data-table-filter-chip"
            onRemove={() => onFilterChange(column.key, undefined)}
            labels={{ remove: labels.removeFilter(columnLabel(column)) }}
          >
            {text}
          </Badge>
        );
      })}
    </>
  );
}
