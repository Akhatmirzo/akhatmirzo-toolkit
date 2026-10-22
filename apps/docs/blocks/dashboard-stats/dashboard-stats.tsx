'use client';

import { formatNumber } from '@akhatmirzo/core';
import { Badge, Button, Card, Progress, SegmentedControl } from '@akhatmirzo/ui';
import { AreaChart, Sparkline } from '@akhatmirzo/ui/charts';
import {
  Download,
  ReceiptText,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

type Period = 'week' | 'month' | 'year';

interface Kpi {
  title: string;
  icon: ReactNode;
  value: string;
  /** O'lchov birligi — qiymatdan kichikroq yoziladi */
  unit?: string;
  /** O'tgan davrga nisbatan o'zgarish, % */
  delta: number;
  /** `true` — o'sish yaxshi (tushum), `false` — kamayish yaxshi (qaytarishlar) */
  upIsGood?: boolean;
  trend: number[];
}

interface Point {
  label: string;
  tushum: number;
  xarajat: number;
}

/** KPI uchun: 234,4 mln */
const mlnShort = (v: number) => `${(v / 1_000_000).toFixed(1).replace('.', ',')} mln`;

/** Qisqa ko'rinish: 63,1 mln so'm */
const mln = (v: number) => `${(v / 1_000_000).toFixed(1).replace('.', ',')} mln so'm`;

const SERIES: Record<Period, Point[]> = {
  week: [
    { label: 'Du', tushum: 8_400_000, xarajat: 5_100_000 },
    { label: 'Se', tushum: 9_150_000, xarajat: 5_600_000 },
    { label: 'Ch', tushum: 7_900_000, xarajat: 4_900_000 },
    { label: 'Pa', tushum: 10_300_000, xarajat: 6_000_000 },
    { label: 'Ju', tushum: 12_800_000, xarajat: 6_700_000 },
    { label: 'Sh', tushum: 14_200_000, xarajat: 7_300_000 },
    { label: 'Ya', tushum: 11_600_000, xarajat: 6_100_000 },
  ],
  month: [
    { label: '1-hafta', tushum: 52_400_000, xarajat: 33_100_000 },
    { label: '2-hafta', tushum: 58_900_000, xarajat: 35_400_000 },
    { label: '3-hafta', tushum: 55_300_000, xarajat: 34_200_000 },
    { label: '4-hafta', tushum: 67_800_000, xarajat: 38_900_000 },
  ],
  year: [
    { label: 'Yan', tushum: 182_000_000, xarajat: 121_000_000 },
    { label: 'Fev', tushum: 171_500_000, xarajat: 118_300_000 },
    { label: 'Mar', tushum: 204_800_000, xarajat: 129_600_000 },
    { label: 'Apr', tushum: 198_200_000, xarajat: 131_900_000 },
    { label: 'May', tushum: 226_400_000, xarajat: 140_200_000 },
    { label: 'Iyn', tushum: 241_700_000, xarajat: 146_800_000 },
    { label: 'Iyl', tushum: 236_100_000, xarajat: 149_500_000 },
    { label: 'Avg', tushum: 258_900_000, xarajat: 152_300_000 },
    { label: 'Sen', tushum: 249_300_000, xarajat: 150_100_000 },
    { label: 'Okt', tushum: 274_600_000, xarajat: 158_700_000 },
  ],
};

const KPIS: Record<Period, Kpi[]> = {
  week: [
    {
      title: 'Tushum',
      icon: <Wallet />,
      value: mlnShort(74_350_000),
      unit: "so'm",
      delta: 12.4,
      trend: [8, 9, 8, 10, 13, 14, 12],
    },
    {
      title: 'Buyurtmalar',
      icon: <ShoppingBag />,
      value: formatNumber(1_284),
      delta: 8.1,
      trend: [150, 162, 148, 181, 205, 232, 206],
    },
    {
      title: 'Yangi mijozlar',
      icon: <Users />,
      value: formatNumber(326),
      delta: -3.2,
      trend: [52, 49, 44, 47, 46, 43, 45],
    },
    {
      title: "O'rtacha chek",
      icon: <ReceiptText />,
      value: formatNumber(57_900),
      unit: "so'm",
      delta: 4.6,
      trend: [54, 55, 53, 56, 58, 57, 59],
    },
  ],
  month: [
    {
      title: 'Tushum',
      icon: <Wallet />,
      value: mlnShort(234_400_000),
      unit: "so'm",
      delta: 9.8,
      trend: [52, 59, 55, 68],
    },
    {
      title: 'Buyurtmalar',
      icon: <ShoppingBag />,
      value: formatNumber(4_912),
      delta: 6.3,
      trend: [1120, 1215, 1180, 1397],
    },
    {
      title: 'Yangi mijozlar',
      icon: <Users />,
      value: formatNumber(1_408),
      delta: 2.1,
      trend: [330, 352, 341, 385],
    },
    {
      title: "O'rtacha chek",
      icon: <ReceiptText />,
      value: formatNumber(47_700),
      unit: "so'm",
      delta: -1.4,
      trend: [49, 48, 47, 48],
    },
  ],
  year: [
    {
      title: 'Tushum',
      icon: <Wallet />,
      value: mlnShort(2_243_500_000),
      unit: "so'm",
      delta: 23.7,
      trend: [182, 171, 205, 198, 226, 242, 236, 259, 249, 275],
    },
    {
      title: 'Buyurtmalar',
      icon: <ShoppingBag />,
      value: formatNumber(48_630),
      delta: 18.2,
      trend: [3.9, 3.7, 4.4, 4.3, 4.9, 5.1, 5.0, 5.4, 5.3, 5.8],
    },
    {
      title: 'Yangi mijozlar',
      icon: <Users />,
      value: formatNumber(15_274),
      delta: 31.5,
      trend: [1.1, 1.2, 1.4, 1.3, 1.5, 1.6, 1.6, 1.7, 1.8, 1.9],
    },
    {
      title: "O'rtacha chek",
      icon: <ReceiptText />,
      value: formatNumber(46_100),
      unit: "so'm",
      delta: 4.9,
      trend: [44, 44, 45, 45, 46, 46, 46, 47, 47, 47],
    },
  ],
};

const REGIONS = [
  { name: 'Toshkent shahri', share: 46 },
  { name: 'Samarqand', share: 18 },
  { name: "Farg'ona", share: 14 },
  { name: 'Buxoro', share: 12 },
  { name: 'Boshqa viloyatlar', share: 10 },
];

const PERIOD_LABEL: Record<Period, string> = {
  week: "o'tgan haftaga nisbatan",
  month: "o'tgan oyga nisbatan",
  year: "o'tgan yilga nisbatan",
};

export default function DashboardStatsBlock() {
  const [period, setPeriod] = useState<Period>('month');

  return (
    <section className="@container w-full bg-background font-sans text-text">
      <div className="flex flex-col gap-6 p-4 @3xl:p-8">
        <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="m-0 text-2xl font-bold tracking-tight">Umumiy ko&apos;rinish</h2>
            <p className="m-0 text-sm text-text-muted">
              Chorsu Market — barcha filiallar bo&apos;yicha savdo ko&apos;rsatkichlari
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              size="sm"
              value={period}
              onValueChange={(value) => setPeriod(value as Period)}
              aria-label="Davr"
            >
              <SegmentedControl.Item value="week">7 kun</SegmentedControl.Item>
              <SegmentedControl.Item value="month">30 kun</SegmentedControl.Item>
              <SegmentedControl.Item value="year">Yil</SegmentedControl.Item>
            </SegmentedControl>
            <Button size="sm" variant="outline" leftIcon={<Download />}>
              Eksport
            </Button>
          </div>
        </div>

        <div className="grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
          {KPIS[period].map((kpi) => {
            const good = kpi.upIsGood === false ? kpi.delta < 0 : kpi.delta >= 0;
            return (
              <Card key={kpi.title} padding="sm" className="gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-text-muted">{kpi.title}</span>
                  <span
                    className="grid size-8 place-items-center rounded-lg bg-primary-soft text-primary-soft-foreground [&_svg]:size-4"
                    aria-hidden="true"
                  >
                    {kpi.icon}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="truncate text-2xl font-bold tracking-tight tabular-nums">
                      {kpi.value}
                      {kpi.unit && (
                        <span className="ml-1 text-sm font-medium text-text-muted">{kpi.unit}</span>
                      )}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                      <Badge size="sm" color={good ? 'success' : 'danger'}>
                        {kpi.delta >= 0 ? (
                          <TrendingUp className="size-3" aria-hidden="true" />
                        ) : (
                          <TrendingDown className="size-3" aria-hidden="true" />
                        )}
                        {kpi.delta > 0 ? '+' : ''}
                        {String(kpi.delta).replace('.', ',')}%
                      </Badge>
                      {PERIOD_LABEL[period]}
                    </span>
                  </div>
                  {/* Qiymat matn bilan berilgan — grafik faqat bezak */}
                  <Sparkline
                    aria-hidden
                    data={kpi.trend}
                    color={good ? 'success' : 'danger'}
                    className="w-20 shrink-0"
                  />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 @5xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-base font-semibold">Tushum va xarajat</h3>
              <p className="m-0 text-sm text-text-muted">
                So&apos;mda, tanlangan davr bo&apos;yicha
              </p>
            </div>
            <AreaChart
              aria-label="Tushum va xarajat dinamikasi"
              className="w-full"
              data={SERIES[period]}
              index="label"
              series={[
                { key: 'tushum', label: 'Tushum' },
                { key: 'xarajat', label: 'Xarajat', color: 'amber' },
              ]}
              valueFormat={mln}
              height={280}
            />
          </Card>

          <Card className="gap-5">
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-base font-semibold">Hududlar bo&apos;yicha</h3>
              <p className="m-0 text-sm text-text-muted">Buyurtmalar ulushi</p>
            </div>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {REGIONS.map((region) => (
                <li key={region.name}>
                  <Progress size="sm" value={region.share} label={region.name} showValue />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
