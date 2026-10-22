import { formatMoney, formatNumber } from '@akhatmirzo/core';
import { Button, Card } from '@akhatmirzo/ui';
import { AreaChart, BarChart, DonutChart, LineChart, Sparkline } from '@akhatmirzo/ui/charts';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Charts', group: "Ma'lumotlar", order: 3 };

const sales = [
  { month: 'Yan', tushum: 42_500_000, xarajat: 28_300_000 },
  { month: 'Fev', tushum: 38_900_000, xarajat: 26_100_000 },
  { month: 'Mar', tushum: 51_200_000, xarajat: 30_400_000 },
  { month: 'Apr', tushum: 47_800_000, xarajat: 31_900_000 },
  { month: 'May', tushum: 58_300_000, xarajat: 33_200_000 },
  { month: 'Iyn', tushum: 63_100_000, xarajat: 35_700_000 },
];
const salesSeries = [
  { key: 'tushum', label: 'Tushum' },
  { key: 'xarajat', label: 'Xarajat', color: 'amber' },
] as const;

const regions = [
  { region: 'Toshkent', onlayn: 1240, dokon: 860 },
  { region: 'Samarqand', onlayn: 610, dokon: 540 },
  { region: "Farg'ona", onlayn: 480, dokon: 520 },
  { region: 'Buxoro', onlayn: 350, dokon: 290 },
];

const expenses = [
  { name: 'Oziq-ovqat', total: 3_850_000 },
  { name: 'Transport', total: 1_240_000 },
  { name: 'Kommunal', total: 960_000 },
  { name: "Ko'ngilochar", total: 720_000 },
  { name: 'Boshqalar', total: 430_000 },
];

const mln = (v: number) => `${(v / 1_000_000).toFixed(1).replace('.', ',')} mln`;

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);

  return (
    <DemoPage
      title="Charts"
      description="@akhatmirzo/ui/charts — Recharts asosida (ixtiyoriy peer). Ranglar faqat tokenlardan, dark rejimda o'zi moslashadi; role=img + aria-label majburiy."
    >
      <DemoSection
        title="AreaChart"
        description={
          <>
            <Code>valueFormat</Code> — tooltip va qiymat o'qi; Tab + ←/→ — klaviatura bilan
          </>
        }
      >
        <AreaChart
          aria-label="Oylik tushum va xarajat"
          data={sales}
          index="month"
          series={salesSeries}
          valueFormat={mln}
        />
        <AreaChart
          aria-label="Oylik tushum va xarajat, yig'ilgan"
          data={sales}
          index="month"
          series={salesSeries}
          valueFormat={(v) => formatMoney(v)}
          stacked
          curve="step"
          height={200}
        />
      </DemoSection>

      <DemoSection title="BarChart" description="vertical (standart), stacked, horizontal">
        <DemoGrid min={320}>
          <BarChart
            aria-label="Viloyatlar bo'yicha buyurtmalar"
            data={regions}
            index="region"
            series={[
              { key: 'onlayn', label: 'Onlayn' },
              { key: 'dokon', label: "Do'kondan", color: 'sky' },
            ]}
            valueFormat={(v) => `${formatNumber(v)} ta`}
            height={240}
          />
          <BarChart
            aria-label="Viloyatlar bo'yicha buyurtmalar, gorizontal"
            data={regions}
            index="region"
            series={[
              { key: 'onlayn', label: 'Onlayn' },
              { key: 'dokon', label: "Do'kondan", color: 'sky' },
            ]}
            orientation="horizontal"
            stacked
            height={240}
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="LineChart va DonutChart">
        <DemoGrid min={320}>
          <LineChart
            aria-label="Tushum dinamikasi"
            data={sales}
            index="month"
            series={salesSeries}
            valueFormat={mln}
            curve="linear"
            height={240}
          />
          <DonutChart
            aria-label="Xarajatlar toifalar bo'yicha"
            data={expenses}
            index="name"
            value="total"
            valueFormat={(v) => formatMoney(v)}
            centerLabel="Jami"
            centerValue={mln(expenses.reduce((s, e) => s + e.total, 0))}
            height={200}
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Sparkline" description="aria-hidden — qiymat matn bilan berilganda">
        <DemoRow>
          {(['primary', 'success', 'danger', 'info'] as const).map((color, i) => (
            <Card key={color} padding="sm" className="w-44 gap-2">
              <p className="text-sm text-text-muted">{color}</p>
              <Sparkline
                aria-label={`${color} trend`}
                data={[3, 5, 4, 8, 6, 9].map((v) => v + i)}
                color={color}
                variant={i % 2 ? 'line' : 'area'}
              />
            </Card>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="Holatlar" description="loading → Skeleton, bo'sh → EmptyState">
        <DemoRow>
          <Button size="sm" onClick={() => setLoading((v) => !v)}>
            loading: {String(loading)}
          </Button>
          <Button size="sm" onClick={() => setEmpty((v) => !v)}>
            bo'sh: {String(empty)}
          </Button>
        </DemoRow>
        <DemoGrid min={320}>
          <AreaChart
            aria-label="Holat namunasi"
            data={empty ? [] : sales}
            index="month"
            series={salesSeries}
            valueFormat={mln}
            loading={loading}
            height={200}
          />
          <DonutChart
            aria-label="Holat namunasi, doira"
            data={empty ? [] : expenses}
            index="name"
            value="total"
            loading={loading}
            height={200}
          />
        </DemoGrid>
      </DemoSection>
    </DemoPage>
  );
}
