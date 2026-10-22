import type { ComponentProps, ReactNode } from 'react';
import { EmptyState } from '../components/empty-state';
import { Skeleton } from '../components/skeleton';
import { cn } from '../lib/cn';
import { ChartLegend, type ChartLegendItem } from './chart-legend';
import { defaultChartLabels, type ChartLabels } from './types';

interface ChartFrameProps extends Omit<ComponentProps<'div'>, 'children'> {
  loading?: boolean;
  empty: boolean;
  emptyState?: ReactNode;
  labels?: Partial<ChartLabels>;
  height: number;
  legend?: readonly ChartLegendItem[] | false;
  children: ReactNode;
}

/** Ichki: tayyor grafiklar uchun yuklanish / bo'sh holat / legend qobig'i */
export function ChartFrame({
  loading,
  empty,
  emptyState,
  labels: labelsProp,
  height,
  legend,
  children,
  className,
  ...props
}: ChartFrameProps) {
  const labels = { ...defaultChartLabels, ...labelsProp };
  const state = loading ? 'loading' : empty ? 'empty' : 'ready';

  return (
    <div
      data-state={state}
      data-loading={loading ? '' : undefined}
      aria-busy={loading || undefined}
      className={cn('flex w-full min-w-0 flex-col gap-3 font-sans text-text', className)}
      {...props}
    >
      {state === 'loading' ? (
        <>
          <Skeleton data-slot="chart-skeleton" className="w-full rounded-xl" style={{ height }} />
          <span role="status" className="sr-only">
            {labels.loading}
          </span>
        </>
      ) : state === 'empty' ? (
        (emptyState ?? (
          <EmptyState
            size="sm"
            bordered
            title={labels.empty}
            className="justify-center"
            style={{ minHeight: height }}
          />
        ))
      ) : (
        <>
          {children}
          {legend && legend.length > 0 && <ChartLegend payload={legend} />}
        </>
      )}
    </div>
  );
}
