'use client';

import { Card, Skeleton, cn } from '@akhatmirzo/ui';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

export interface KpiCardProps {
  title: string;
  value: string;
  /** Qisqartirilgan qiymatning to'liq ko'rinishi */
  fullValue?: string;
  /** Foizdagi o'zgarish (null — solishtirib bo'lmaydi) */
  change: number | null;
  icon: LucideIcon;
  /** Kichik grafik uchun qiymatlar */
  trend: number[];
  loading?: boolean;
}

export function KpiCard({
  title,
  value,
  fullValue,
  change,
  icon: Icon,
  trend,
  loading,
}: KpiCardProps) {
  const gradientId = 'kpi' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (loading) {
    return (
      <Card padding="sm" className="gap-4" aria-busy="true">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-28" />
      </Card>
    );
  }

  const up = (change ?? 0) >= 0;
  const changeText =
    change === null ? '—' : `${up ? '+' : '−'}${Math.abs(change).toFixed(1).replace('.', ',')}%`;

  return (
    <Card padding="sm" className="relative gap-3 overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-text-muted">{title}</h2>
        <span className="grid size-8 place-items-center rounded-lg bg-primary-soft text-primary-soft-foreground">
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
      <p
        className="text-2xl font-bold tracking-tight whitespace-nowrap tabular-nums"
        title={fullValue}
      >
        {fullValue ? (
          <>
            <span aria-hidden="true">{value}</span>
            <span className="sr-only">{fullValue}</span>
          </>
        ) : (
          value
        )}
      </p>
      <div className="flex items-end justify-between gap-3">
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold tabular-nums',
              change === null
                ? 'bg-surface-muted text-text-muted'
                : up
                  ? 'bg-success-soft text-success-soft-foreground'
                  : 'bg-danger-soft text-danger-soft-foreground',
            )}
          >
            {change !== null &&
              (up ? (
                <TrendingUp aria-hidden="true" className="size-3.5" />
              ) : (
                <TrendingDown aria-hidden="true" className="size-3.5" />
              ))}
            <span className="sr-only">{up ? "O'sish" : 'Pasayish'}:</span>
            {changeText}
          </span>
          o&apos;tgan davrga nisbatan
        </p>
        <div aria-hidden="true" className="h-9 w-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trend.map((v, i) => ({ i, v }))}
              margin={{ top: 2, bottom: 2, left: 0, right: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    style={{
                      stopColor: up ? 'var(--ak-success)' : 'var(--ak-danger)',
                      stopOpacity: 0.25,
                    }}
                  />
                  <stop
                    offset="100%"
                    style={{
                      stopColor: up ? 'var(--ak-success)' : 'var(--ak-danger)',
                      stopOpacity: 0,
                    }}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={up ? 'var(--ak-success)' : 'var(--ak-danger)'}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
