import { formatNumber } from '@akhatmirzo/core';
import type { ReactNode } from 'react';

export type DataTableFilterType = 'select' | 'multiselect' | 'range' | 'date';

export interface DataTableFilterOption {
  value: string;
  label: ReactNode;
}

/** `range` filtri qiymati (son) */
export interface DataTableRangeValue {
  min?: number;
  max?: number;
}

/** `date` filtri qiymati (kun aniqligida, chegaralar kiradi) */
export interface DataTableDateRangeValue {
  from?: Date | null;
  to?: Date | null;
}

/** Filtr qiymati: select — `string`, multiselect — `string[]`, range, date */
export type DataTableFilterValue =
  string | string[] | DataTableRangeValue | DataTableDateRangeValue;

export interface DataTableColumn<T> {
  /** Ustun id'si; `accessor` berilmasa — `row[key]` qiymati */
  key: string;
  header: ReactNode;
  /** Saralash, filtr va qidiruv uchun qiymat (default — `row[key]`) */
  accessor?: (row: T) => unknown;
  /** Katak ko'rinishi (default — qiymat matni) */
  cell?: (row: T) => ReactNode;
  /** Kenglik: px (son) yoki CSS qiymat */
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  /** Raqamli ustun: o'ngga tekislanadi, `tabular-nums` */
  numeric?: boolean;
  sortable?: boolean;
  filter?: DataTableFilterType;
  /** select / multiselect variantlari (default — ma'lumotdagi noyob qiymatlar) */
  filterOptions?: DataTableFilterOption[];
  /** Filtr va badge'dagi nom (default — `header` matn bo'lsa o'zi, aks holda `key`) */
  filterLabel?: string;
  /** Umumiy qidiruvda qatnashadimi (default `true`) */
  searchable?: boolean;
  /** Qidiruv uchun matn (default — qiymat; sana `dd.MM.yyyy` ko'rinishida) */
  searchValue?: (row: T) => string;
  /** "Ustunlar" menyusida yashirish mumkinmi (default `true`) */
  hideable?: boolean;
  /** Boshlang'ich holatda yashirin */
  hidden?: boolean;
  /** Katak (`td`) klassi */
  className?: string;
}

export interface DataTableSort {
  id: string;
  desc: boolean;
}

/** Jadval holati — `manual` rejimida `onStateChange` orqali serverga */
export interface DataTableState {
  sorting: DataTableSort[];
  search: string;
  filters: Record<string, DataTableFilterValue>;
  pagination: { pageIndex: number; pageSize: number };
}

export interface DataTableEmptyState {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export interface DataTableLabels {
  search?: string;
  searchAria?: string;
  filters?: string;
  columns?: string;
  selectAll?: string;
  selectRow?: string;
  selected?: (count: number) => string;
  clearSelection?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  noResultsTitle?: string;
  noResultsDescription?: string;
  clearFilters?: string;
  errorTitle?: string;
  retry?: string;
  range?: (from: number, to: number, total: number) => string;
  total?: (count: number) => string;
  noRows?: string;
  pageSize?: string;
  prevPage?: string;
  nextPage?: string;
  page?: (page: number) => string;
  pagination?: string;
  rowActions?: string;
  loading?: string;
  all?: string;
  min?: string;
  max?: string;
  from?: string;
  to?: string;
  removeFilter?: (label: string) => string;
}

export const defaultLabels: Required<DataTableLabels> = {
  search: 'Qidirish...',
  searchAria: 'Jadvalda qidirish',
  filters: 'Filtrlar',
  columns: 'Ustunlar',
  selectAll: 'Hammasini tanlash',
  selectRow: 'Qatorni tanlash',
  selected: (n) => `${n} ta tanlandi`,
  clearSelection: 'Bekor qilish',
  emptyTitle: "Hozircha ma'lumot yo'q",
  emptyDescription: "Yangi yozuvlar shu yerda paydo bo'ladi.",
  noResultsTitle: 'Hech narsa topilmadi',
  noResultsDescription: "Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring.",
  clearFilters: 'Filtrlarni tozalash',
  errorTitle: "Ma'lumotlarni yuklab bo'lmadi",
  retry: 'Qayta urinish',
  range: (from, to, total) => `${from}–${to} / ${total}`,
  total: (n) => `${formatNumber(n)} ta qator`,
  noRows: '0 natija',
  pageSize: 'Sahifada',
  prevPage: 'Oldingi sahifa',
  nextPage: 'Keyingi sahifa',
  page: (p) => `${p}-sahifa`,
  pagination: 'Sahifalash',
  rowActions: 'Amallar',
  loading: 'Yuklanmoqda',
  all: 'Hammasi',
  min: 'dan',
  max: 'gacha',
  from: 'Boshlanish',
  to: 'Tugash',
  removeFilter: (label) => `${label} filtrini olib tashlash`,
};
