import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getPagination, usePagination } from './use-pagination';

const pages = (total: number, page: number, siblings = 1, pageSize = 10) =>
  getPagination({ total, pageSize, page, siblings }).pages;

const E = 'ellipsis' as const;

describe('getPagination', () => {
  it('o‘rtada: 1 … 4 5 6 … 20', () => {
    expect(pages(200, 5)).toEqual([1, E, 4, 5, 6, E, 20]);
  });

  it('boshida va oxirida ellipsis faqat bir tomonda', () => {
    expect(pages(200, 1)).toEqual([1, 2, 3, 4, 5, E, 20]);
    expect(pages(200, 4)).toEqual([1, 2, 3, 4, 5, E, 20]);
    expect(pages(200, 20)).toEqual([1, E, 16, 17, 18, 19, 20]);
  });

  it('kam sahifada hammasi ko‘rsatiladi', () => {
    expect(pages(70, 4)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(pages(30, 2)).toEqual([1, 2, 3]);
    expect(pages(11, 1)).toEqual([1, 2]);
  });

  it('bo‘sh ro‘yxat: bitta sahifa, from=to=0', () => {
    expect(getPagination({ total: 0, pageSize: 10, page: 1 })).toEqual({
      pages: [1],
      pageCount: 1,
      page: 1,
      hasPrev: false,
      hasNext: false,
      from: 0,
      to: 0,
    });
  });

  it('siblings=2', () => {
    expect(pages(500, 25, 2)).toEqual([1, E, 23, 24, 25, 26, 27, E, 50]);
  });

  it('siblings=0', () => {
    expect(pages(200, 10, 0)).toEqual([1, E, 10, E, 20]);
  });

  it('from/to, hasPrev/hasNext', () => {
    const r = getPagination({ total: 95, pageSize: 10, page: 10 });
    expect(r).toMatchObject({ pageCount: 10, from: 91, to: 95, hasPrev: true, hasNext: false });
  });

  it('yaroqsiz kiritish qisiladi', () => {
    expect(getPagination({ total: 50, pageSize: 10, page: 99 }).page).toBe(5);
    expect(getPagination({ total: 50, pageSize: 10, page: -3 }).page).toBe(1);
    expect(getPagination({ total: 50, pageSize: 10, page: NaN }).page).toBe(1);
    expect(getPagination({ total: -5, pageSize: 0, page: 1 })).toMatchObject({
      pageCount: 1,
      from: 0,
      to: 0,
    });
    expect(getPagination({ total: 10, pageSize: 0, page: 3 })).toMatchObject({
      pageCount: 10,
      from: 3,
      to: 3,
    });
  });

  it('har qanday holatda: tartiblangan, takrorsiz, joriy sahifa va chetlar bor, uzunlik barqaror', () => {
    for (let count = 1; count <= 30; count++) {
      for (let siblings = 0; siblings <= 3; siblings++) {
        const slots = siblings * 2 + 5;
        for (let page = 1; page <= count; page++) {
          const items = pages(count, page, siblings, 1);
          const nums = items.filter((p): p is number => p !== E);
          expect(nums).toEqual([...nums].sort((a, b) => a - b));
          expect(new Set(nums).size).toBe(nums.length);
          expect(nums).toContain(page);
          expect(nums[0]).toBe(1);
          expect(nums[nums.length - 1]).toBe(count);
          expect(items.length).toBe(Math.min(count, slots));
          // ellipsis kamida 2 ta sahifani yashiradi
          items.forEach((it, i) => {
            if (it !== E) return;
            const prev = items[i - 1] as number;
            const next = items[i + 1] as number;
            expect(next - prev).toBeGreaterThan(2);
          });
        }
      }
    }
  });
});

describe('usePagination', () => {
  it('memo: bir xil kiritishda bir xil obyekt', () => {
    const { result, rerender } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10, page: 2 }),
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
    expect(first.pages).toEqual([1, 2, 3, 4, 5, E, 10]);
  });
});
