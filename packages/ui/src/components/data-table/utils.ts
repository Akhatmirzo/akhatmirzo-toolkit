import { formatDate, formatNumber, searchMatch } from '@akhatmirzo/core';
import { isValidElement, type ReactNode } from 'react';
import type {
  DataTableColumn,
  DataTableDateRangeValue,
  DataTableFilterOption,
  DataTableFilterValue,
  DataTableRangeValue,
} from './types';

/** Ustun qiymati: `accessor` yoki `row[key]` */
export function getColumnValue<T>(column: DataTableColumn<T>, row: T): unknown {
  if (column.accessor) return column.accessor(row);
  return (row as Record<string, unknown>)[column.key];
}

/** Qiymatni matnga: sana — `dd.MM.yyyy`, qolgani — `String` (son formati `cell` orqali) */
export function valueToText(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return formatDate(value);
  return String(value);
}

/** Qidiruv: o'zbek harflariga sezgir emas (`core` searchMatch) */
export function matchesSearch<T>(column: DataTableColumn<T>, row: T, query: string): boolean {
  const text = column.searchValue
    ? column.searchValue(row)
    : (() => {
        const value = getColumnValue(column, row);
        // Son ham guruhlanmagan ko'rinishda qidiriladi ("1042" va "1 042")
        return typeof value === 'number' ? `${value} ${valueToText(value)}` : valueToText(value);
      })();
  return searchMatch(text, query).match;
}

/** Saralash: son, sana, matn (o'zbek alifbosi), bo'sh qiymat oxirida */
export function compareValues(a: unknown, b: unknown): number {
  if (a == null || a === '') return b == null || b === '' ? 0 : 1;
  if (b == null || b === '') return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), 'uz', { numeric: true, sensitivity: 'base' });
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function toTime(value: unknown): number | null {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number' || typeof value === 'string') {
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

/** Filtr qiymati bo'shmi (bo'sh filtr holatdan olib tashlanadi) */
export function isEmptyFilter(value: DataTableFilterValue | undefined): boolean {
  if (value == null || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') {
    if ('min' in value || 'max' in value) {
      const v = value as DataTableRangeValue;
      return !Number.isFinite(v.min) && !Number.isFinite(v.max);
    }
    const v = value as DataTableDateRangeValue;
    return !v.from && !v.to;
  }
  return false;
}

/** Bitta ustun filtri qatorga mos keladimi */
export function matchesFilter(
  type: DataTableColumn<unknown>['filter'],
  value: unknown,
  filter: DataTableFilterValue,
): boolean {
  if (isEmptyFilter(filter)) return true;
  switch (type) {
    case 'select':
      return String(value ?? '') === filter;
    case 'multiselect':
      return (filter as string[]).includes(String(value ?? ''));
    case 'range': {
      const { min, max } = filter as DataTableRangeValue;
      const n = typeof value === 'number' ? value : Number(value);
      if (value == null || Number.isNaN(n)) return false;
      if (Number.isFinite(min) && n < (min as number)) return false;
      if (Number.isFinite(max) && n > (max as number)) return false;
      return true;
    }
    case 'date': {
      const { from, to } = filter as DataTableDateRangeValue;
      const t = toTime(value);
      if (t == null) return false;
      if (from && t < startOfDay(from)) return false;
      // `to` kuni ham kiradi
      if (to && t >= startOfDay(to) + 86_400_000) return false;
      return true;
    }
    default:
      return true;
  }
}

/** ReactNode'dan oddiy matn (badge va aria-label uchun) */
export function nodeToText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeToText(node.props.children);
  return '';
}

export function columnLabel<T>(column: DataTableColumn<T>): string {
  return column.filterLabel ?? (nodeToText(column.header) || column.key);
}

/** Filtr variantlari: berilgan yoki ma'lumotdagi noyob qiymatlar (soni bilan) */
export function resolveFilterOptions<T>(
  column: DataTableColumn<T>,
  data: readonly T[],
  withCounts: boolean,
): Array<DataTableFilterOption & { count?: number }> {
  const counts = new Map<string, number>();
  if (withCounts || !column.filterOptions) {
    for (const row of data) {
      const v = getColumnValue(column, row);
      if (v == null || v === '') continue;
      const key = String(v);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const options =
    column.filterOptions ??
    [...counts.keys()]
      .sort((a, b) => compareValues(a, b))
      .map((value) => ({ value, label: value }));
  return options.map((o) => ({ ...o, count: withCounts ? (counts.get(o.value) ?? 0) : undefined }));
}

/** Faol filtr badge'i matni */
export function describeFilter<T>(
  column: DataTableColumn<T>,
  value: DataTableFilterValue,
  options: DataTableFilterOption[],
): string {
  const optionText = (v: string) => {
    const option = options.find((o) => o.value === v);
    return option ? nodeToText(option.label) || v : v;
  };
  const label = columnLabel(column);
  switch (column.filter) {
    case 'select':
      return `${label}: ${optionText(value as string)}`;
    case 'multiselect':
      return `${label}: ${(value as string[]).map(optionText).join(', ')}`;
    case 'range': {
      const { min, max } = value as DataTableRangeValue;
      const a = Number.isFinite(min) ? formatNumber(min as number) : '';
      const b = Number.isFinite(max) ? formatNumber(max as number) : '';
      if (a && b) return `${label}: ${a} – ${b}`;
      return a ? `${label}: ≥ ${a}` : `${label}: ≤ ${b}`;
    }
    case 'date': {
      const { from, to } = value as DataTableDateRangeValue;
      const a = from ? formatDate(from) : '';
      const b = to ? formatDate(to) : '';
      if (a && b) return `${label}: ${a} – ${b}`;
      return a ? `${label}: ≥ ${a}` : `${label}: ≤ ${b}`;
    }
    default:
      return label;
  }
}
