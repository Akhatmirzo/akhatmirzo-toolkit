import type { ComponentProps, ReactNode } from 'react';
import type { ChartA11yProps } from './chart-container';
import type { ChartColor } from './theme';

/** Seriya: `data` dagi raqamli maydon */
export interface ChartSeries<T> {
  key: keyof T & string;
  /** Legend va tooltip'dagi nom. Standart — `key` */
  label?: string;
  /** Token nomi yoki CSS rang. Standart — `chartColors` palitrasidan ketma-ket */
  color?: ChartColor;
}

export interface ChartLabels {
  /** Bo'sh holat sarlavhasi */
  empty: string;
  /** Yuklanish e'loni (ekran o'quvchi uchun) */
  loading: string;
}

export const defaultChartLabels: ChartLabels = {
  empty: "Ma'lumot yo'q",
  loading: 'Yuklanmoqda',
};

/** Barcha tayyor grafiklar uchun umumiy props */
export interface ChartStateProps {
  /** Balandlik, px. Standart — `280` */
  height?: number;
  /** Ma'lumot bo'sh bo'lsa ko'rsatiladi. Standart — `EmptyState` ("Ma'lumot yo'q") */
  emptyState?: ReactNode;
  /** `true` — grafik o'rnida Skeleton */
  loading?: boolean;
  /** Ekran o'quvchi uchun qisqa xulosa (`aria-describedby`) */
  description?: ReactNode;
  /** Ichki matnlar */
  labels?: Partial<ChartLabels>;
}

export type ChartRootProps = Omit<
  ComponentProps<'div'>,
  'title' | 'aria-label' | 'role' | 'children'
> &
  ChartA11yProps;

/** Area / Bar / Line uchun umumiy props */
export type CartesianChartProps<T, K extends keyof T & string> = ChartRootProps &
  ChartStateProps & {
    /** Ma'lumotlar: `[{ month: 'Yan', tushum: 120 }, ...]` */
    data: readonly T[];
    /** Kategoriya (x o'qi) maydoni */
    index: K;
    /** Ko'rsatiladigan seriyalar */
    series: readonly ChartSeries<T>[];
    /** Qiymat ko'rinishi — tooltip va qiymat o'qi. Standart — `formatNumber` */
    valueFormat?: (value: number) => string;
    /** Kategoriya ko'rinishi — o'q va tooltip sarlavhasi */
    indexFormat?: (value: T[K]) => string;
    /** Legend. Standart — `true` */
    legend?: boolean;
    /** To'r chiziqlari. Standart — `true` */
    grid?: boolean;
    /** Tooltip. Standart — `true` */
    tooltip?: boolean;
  };

export type ChartCurve = 'monotone' | 'linear' | 'step';
