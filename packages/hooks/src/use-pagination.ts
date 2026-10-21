import { useMemo } from 'react';

export type PaginationItem = number | 'ellipsis';

export interface UsePaginationParams {
  /** Jami yozuvlar soni. */
  total: number;
  /** Bir sahifadagi yozuvlar soni. */
  pageSize: number;
  /** Joriy sahifa (1 dan boshlanadi; chegaradan chiqsa qisiladi). */
  page: number;
  /** Joriy sahifaning har ikki tomonida ko'rsatiladigan sahifalar. Standart: `1`. */
  siblings?: number;
}

export interface UsePaginationResult {
  /** Tugmalar ro'yxati, masalan `[1, 'ellipsis', 4, 5, 6, 'ellipsis', 20]`. */
  pages: PaginationItem[];
  pageCount: number;
  /** Qisilgan joriy sahifa. */
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
  /** Joriy sahifadagi birinchi yozuv tartib raqami (1 dan; bo'sh ro'yxatda `0`). */
  from: number;
  /** Joriy sahifadagi oxirgi yozuv tartib raqami. */
  to: number;
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function int(n: number, fallback: number): number {
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

/**
 * Sahifalash hisobi (sof funksiya). Elementlar soni barqaror: `siblings * 2 + 5`
 * (sahifalar kam bo'lsa — hammasi). Ko'p nuqta faqat 2+ sahifani yashirganda qo'yiladi.
 * @example
 * getPagination({ total: 200, pageSize: 10, page: 5 }).pages
 * // [1, 'ellipsis', 4, 5, 6, 'ellipsis', 20]
 */
export function getPagination({
  total,
  pageSize,
  page,
  siblings = 1,
}: UsePaginationParams): UsePaginationResult {
  const size = Math.max(1, int(pageSize, 1));
  const count = Math.max(0, int(total, 0));
  const sib = Math.max(0, int(siblings, 1));
  const pageCount = Math.max(1, Math.ceil(count / size));
  const current = Math.min(pageCount, Math.max(1, int(page, 1)));

  // MUI algoritmi (boundary = 1)
  const start = range(1, Math.min(1, pageCount));
  const end = range(Math.max(pageCount, 2), pageCount);
  const sibStart = Math.max(Math.min(current - sib, pageCount - 1 - sib * 2 - 1), 3);
  const sibEnd = Math.min(Math.max(current + sib, 1 + sib * 2 + 2), pageCount - 1 - 1);

  const pages: PaginationItem[] = [
    ...start,
    ...(sibStart > 3 ? (['ellipsis'] as const) : 2 < pageCount - 1 ? [2] : []),
    ...range(sibStart, sibEnd),
    ...(sibEnd < pageCount - 2
      ? (['ellipsis'] as const)
      : pageCount - 1 > 1
        ? [pageCount - 1]
        : []),
    ...end,
  ];

  return {
    pages,
    pageCount,
    page: current,
    hasPrev: current > 1,
    hasNext: current < pageCount,
    from: count === 0 ? 0 : (current - 1) * size + 1,
    to: Math.min(current * size, count),
  };
}

/**
 * DataTable va ro'yxatlar uchun sahifalash ("1 … 4 5 6 … 20").
 * @example
 * const { pages, hasPrev, hasNext, from, to } = usePagination({ total, pageSize: 20, page });
 */
export function usePagination({
  total,
  pageSize,
  page,
  siblings = 1,
}: UsePaginationParams): UsePaginationResult {
  return useMemo(
    () => getPagination({ total, pageSize, page, siblings }),
    [total, pageSize, page, siblings],
  );
}
