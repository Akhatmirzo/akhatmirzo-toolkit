import { usePagination } from '@akhatmirzo/hooks';
import { cn } from '../../lib/cn';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Select } from '../select';
import { ChevronIcon } from './icons';
import type { DataTableLabels } from './types';

interface PaginationProps {
  total: number;
  pageIndex: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  labels: Required<DataTableLabels>;
}

/** Pastki qator: "1–10 / 248", sahifa hajmi, sahifa raqamlari */
export function DataTablePagination({
  total,
  pageIndex,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  labels,
}: PaginationProps) {
  // Joriy hajm ro'yxatda bo'lmasa ham ko'rinsin (masalan pageSize: 5)
  const sizes = [...new Set([...pageSizeOptions, pageSize])].sort((a, b) => a - b);
  const { pages, page, hasPrev, hasNext, from, to } = usePagination({
    total,
    pageSize,
    page: pageIndex + 1,
  });

  return (
    <div
      data-slot="data-table-footer"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border px-3 py-2.5 text-[13px] text-text-muted"
    >
      <span aria-live="polite" className="tabular-nums">
        {total ? labels.range(from, to, total) : labels.noRows}
      </span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-2">
          <span>{labels.pageSize}</span>
          <Select
            size="sm"
            aria-label={labels.pageSize}
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
            className="w-20 tabular-nums"
          >
            {sizes.map((n) => (
              <Select.Item key={n} value={String(n)}>
                {n}
              </Select.Item>
            ))}
          </Select>
        </label>
        <nav aria-label={labels.pagination} className="flex items-center gap-1">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={labels.prevPage}
            disabled={!hasPrev}
            onClick={() => onPageChange(page - 2)}
          >
            <ChevronIcon dir="left" />
          </IconButton>
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e${i}`} aria-hidden="true" className="px-1 text-text-muted">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                aria-label={labels.page(p)}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => onPageChange(p - 1)}
                className={cn(
                  'min-w-8 px-2 tabular-nums',
                  p === page &&
                    'bg-primary-soft text-primary-soft-foreground not-data-disabled:hover:bg-primary-soft-hover',
                )}
              >
                {p}
              </Button>
            ),
          )}
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={labels.nextPage}
            disabled={!hasNext}
            onClick={() => onPageChange(page)}
          >
            <ChevronIcon dir="right" />
          </IconButton>
        </nav>
      </div>
    </div>
  );
}
