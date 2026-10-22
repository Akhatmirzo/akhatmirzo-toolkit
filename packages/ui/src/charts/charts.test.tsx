import { formatMoney } from '@akhatmirzo/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import {
  AreaChart,
  BarChart,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  DonutChart,
  LineChart,
  Sparkline,
  chartColors,
  resolveChartColor,
} from '.';

// jsdom'da layout yo'q — ResponsiveContainer o'lchami 0 bo'lib, grafik chizilmaydi.
// Recharts testlash tavsiyasiga ko'ra faqat konteynerga o'lcham beramiz (matn o'lchami 0
// qoladi, aks holda o'q yozuvlari "ustma-ust" deb yashiriladi) va animatsiyani o'chiramiz
// (Recharts `prefers-reduced-motion` ni hisobga oladi).
beforeAll(() => {
  const original = HTMLElement.prototype.getBoundingClientRect;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (!this.classList.contains('recharts-responsive-container')) return original.call(this);
    return {
      width: 600,
      height: 300,
      top: 0,
      left: 0,
      right: 600,
      bottom: 300,
      x: 0,
      y: 0,
    } as DOMRect;
  });
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
});

const sales = [
  { month: 'Yan', tushum: 1_200_000, xarajat: 800_000 },
  { month: 'Fev', tushum: 1_500_000, xarajat: 900_000 },
  { month: 'Mar', tushum: 1_100_000, xarajat: 950_000 },
];
const series = [
  { key: 'tushum', label: 'Tushum' },
  { key: 'xarajat', label: 'Xarajat', color: 'danger' },
] as const;

describe('theme', () => {
  it('resolveChartColor — token nomi, palitra va xom qiymat', () => {
    expect(resolveChartColor('success')).toBe('var(--ak-success)');
    expect(resolveChartColor(undefined, 1)).toBe(chartColors[1]);
    expect(resolveChartColor(undefined, 5)).toBe(chartColors[0]);
    expect(resolveChartColor('var(--ak-indigo-400)')).toBe('var(--ak-indigo-400)');
  });
});

describe('ChartContainer', () => {
  it('role="figure", aria-label, description va config → CSS o‘zgaruvchilar', () => {
    render(
      <ChartContainer
        aria-label="Savdo"
        description="Mart oyida tushum pasaygan"
        config={{ tushum: { label: 'Tushum', color: 'success' }, 'boshqa xarajat': {} }}
        height={200}
        className="mt-2"
        data-testid="c"
      >
        <div />
      </ChartContainer>,
    );
    const root = screen.getByRole('figure', { name: 'Savdo' });
    expect(root).toHaveAccessibleDescription('Mart oyida tushum pasaygan');
    expect(root).toHaveClass('mt-2');
    expect(root.style.getPropertyValue('--chart-tushum')).toBe('var(--ak-success)');
    expect(root.style.getPropertyValue('--chart-boshqa-xarajat')).toBe(chartColors[1]);
    expect(root.style.height).toBe('200px');
  });

  it('title — accessible nom sifatida', () => {
    render(
      <ChartContainer title="Oylik tushum">
        <div />
      </ChartContainer>,
    );
    expect(screen.getByRole('figure', { name: 'Oylik tushum' })).not.toHaveAttribute('title');
  });
});

describe('ChartTooltip', () => {
  const payload = [
    { dataKey: 'tushum', name: 'tushum', value: 1_500_000, color: 'red' },
  ] as unknown as ComponentProps<typeof ChartTooltip>['payload'];

  it('format va config label ishlatiladi', () => {
    render(
      <ChartContainer aria-label="x" config={{ tushum: { label: 'Tushum' } }}>
        <ChartTooltip active payload={payload} label="Fev" format={(v) => formatMoney(v)} />
      </ChartContainer>,
    );
    // ChartContainer ichida Recharts'siz — tooltip ResponsiveContainer ichida chiziladi
    expect(screen.getByText('Fev')).toBeInTheDocument();
    expect(screen.getByText('Tushum')).toBeInTheDocument();
    expect(screen.getByText("1 500 000 so'm")).toBeInTheDocument();
  });

  it('standart format — formatNumber; faol bo‘lmasa hech narsa', () => {
    const { container, rerender } = render(<ChartTooltip active payload={payload} />);
    expect(screen.getByText('1 500 000')).toBeInTheDocument();
    rerender(<ChartTooltip active={false} payload={payload} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ChartLegend', () => {
  it('elementlar ro‘yxati, type="none" yashiriladi, Recharts props DOM’ga tushmaydi', () => {
    const extra = { verticalAlign: 'top', iconSize: 14 } as object;
    render(
      <ChartLegend
        aria-label="Seriyalar"
        payload={[
          { value: 'Tushum', color: 'red' },
          { value: 'Yashirin', type: 'none' },
        ]}
        {...extra}
      />,
    );
    const list = screen.getByRole('list', { name: 'Seriyalar' });
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(list).not.toHaveAttribute('verticalAlign');
    expect(list).not.toHaveAttribute('iconSize');
  });
});

describe.each([
  ['AreaChart', AreaChart],
  ['LineChart', LineChart],
  ['BarChart', BarChart],
] as const)('%s', (_name, Chart) => {
  it('seriyalar, legend va role="figure" + aria-label', () => {
    const { container } = render(
      <Chart aria-label="Oylik tushum" data={sales} index="month" series={series} />,
    );
    expect(screen.getByRole('figure', { name: 'Oylik tushum' })).toBeInTheDocument();
    expect(container.querySelector('.recharts-surface')).toBeInTheDocument();
    const legend = container.querySelector('[data-slot="chart-legend"]')!;
    expect(legend).toHaveTextContent('Tushum');
    expect(legend).toHaveTextContent('Xarajat');
    expect(container.querySelector('[data-state="ready"]')).toBeInTheDocument();
  });

  it('valueFormat qiymat o‘qida ishlatiladi', () => {
    const { container } = render(
      <Chart
        title="Tushum"
        data={sales}
        index="month"
        series={series}
        valueFormat={(v) => `${v / 1000} ming`}
        legend={false}
      />,
    );
    const ticks = [...container.querySelectorAll('.recharts-cartesian-axis-tick-value')].map(
      (t) => t.textContent,
    );
    expect(ticks.some((t) => t?.endsWith(' ming'))).toBe(true);
    expect(container.querySelector('[data-slot="chart-legend"]')).toBeNull();
  });

  it('bo‘sh ma’lumot — EmptyState, emptyState bilan almashtiriladi', () => {
    const { rerender } = render(<Chart aria-label="x" data={[]} index="month" series={series} />);
    expect(screen.getByRole('heading', { name: "Ma'lumot yo'q" })).toBeInTheDocument();
    expect(screen.queryByRole('figure')).not.toBeInTheDocument();
    rerender(
      <Chart
        aria-label="x"
        data={[] as typeof sales}
        index="month"
        series={series}
        emptyState={<p>Hali savdo yo&apos;q</p>}
      />,
    );
    expect(screen.getByText("Hali savdo yo'q")).toBeInTheDocument();
  });

  it('loading — Skeleton va aria-busy', () => {
    const { container } = render(
      <Chart aria-label="x" data={sales} index="month" series={series} loading height={200} />,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('data-loading');
    const skeleton = container.querySelector('[data-slot="chart-skeleton"]') as HTMLElement;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.style.height).toBe('200px');
    expect(screen.getByRole('status')).toHaveTextContent('Yuklanmoqda');
    expect(container.querySelector('.recharts-surface')).toBeNull();
  });

  it('className, ref va qolgan atributlar ildizga', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Chart
        ref={(el) => {
          node = el;
        }}
        aria-label="x"
        data={sales}
        index="month"
        series={series}
        className="mt-4"
        id="ch"
      />,
    );
    expect(node).toHaveAttribute('id', 'ch');
    expect(node).toHaveClass('mt-4', 'flex');
  });
});

describe('AreaChart / BarChart xususiyatlari', () => {
  it('stacked — bitta stackId', () => {
    const { container } = render(
      <AreaChart aria-label="x" data={sales} index="month" series={series} stacked />,
    );
    expect(container.querySelectorAll('.recharts-area')).toHaveLength(2);
  });

  it('BarChart horizontal — kategoriyalar y o‘qida', () => {
    const { container } = render(
      <BarChart
        aria-label="x"
        data={sales}
        index="month"
        series={series}
        orientation="horizontal"
        legend={false}
      />,
    );
    const yTicks = container.querySelectorAll('.recharts-yAxis-tick-labels text');
    expect([...yTicks].map((t) => t.textContent)).toEqual(['Yan', 'Fev', 'Mar']);
  });

  it('klaviatura: fokus va strelka tooltip’ni ochadi (accessibilityLayer)', async () => {
    const { container } = render(
      <LineChart
        aria-label="x"
        data={sales}
        index="month"
        series={series}
        valueFormat={(v) => formatMoney(v)}
      />,
    );
    const surface = container.querySelector('.recharts-surface')!;
    expect(surface).toHaveAttribute('tabindex', '0');
    await act(async () => {
      fireEvent.focus(surface);
      fireEvent.keyDown(surface, { key: 'ArrowRight' });
    });
    const tooltip = container.querySelector('[data-slot="chart-tooltip"]');
    expect(tooltip).not.toBeNull();
    expect(tooltip!.textContent).toContain("so'm");
  });
});

describe('DonutChart', () => {
  const byCategory = [
    { name: 'Oziq-ovqat', total: 4_200_000 },
    { name: 'Transport', total: 1_300_000 },
    { name: 'Kommunal', total: 900_000 },
  ];

  it('markaz: centerLabel + jami (valueFormat), legend', () => {
    const { container } = render(
      <DonutChart
        aria-label="Xarajatlar"
        data={byCategory}
        index="name"
        value="total"
        centerLabel="Jami"
        valueFormat={(v) => formatMoney(v)}
      />,
    );
    expect(screen.getByRole('figure', { name: 'Xarajatlar' })).toBeInTheDocument();
    const center = container.querySelector('[data-slot="chart-center"]')!;
    expect(center).toHaveTextContent('Jami');
    expect(center).toHaveTextContent("6 400 000 so'm");
    expect(container.querySelectorAll('.recharts-pie-sector')).toHaveLength(3);
    expect(container.querySelector('[data-slot="chart-legend"]')).toHaveTextContent('Transport');
  });

  it('centerValue={null} — faqat izoh', () => {
    const { container } = render(
      <DonutChart
        aria-label="x"
        data={byCategory}
        index="name"
        value="total"
        centerLabel="Toifalar"
        centerValue={null}
      />,
    );
    expect(container.querySelector('[data-slot="chart-center"]')).toHaveTextContent(/^Toifalar$/);
  });

  it('jami 0 — bo‘sh holat; loading — Skeleton', () => {
    const { container, rerender } = render(
      <DonutChart aria-label="x" data={[{ name: 'a', total: 0 }]} index="name" value="total" />,
    );
    expect(screen.getByText("Ma'lumot yo'q")).toBeInTheDocument();
    rerender(
      <DonutChart
        aria-label="x"
        data={byCategory}
        index="name"
        value="total"
        loading
        labels={{ loading: 'Kuting' }}
      />,
    );
    expect(container.querySelector('[data-slot="chart-skeleton"]')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Kuting');
  });
});

describe('Sparkline', () => {
  it('chiziq (path) chiziladi, rang tokendan', () => {
    const { container } = render(
      <Sparkline aria-label="Haftalik trend" data={[3, 5, 4, 8, 6]} color="success" />,
    );
    expect(screen.getByRole('img', { name: 'Haftalik trend' })).toBeInTheDocument();
    const curve = container.querySelector('.recharts-area-curve')!;
    expect(curve).toBeInTheDocument();
    expect(curve.getAttribute('d')).toMatch(/^M/);
    expect(curve).toHaveAttribute('stroke', 'var(--ak-success)');
    // Tooltip yo'q — fokus to'xtashi ham yo'q
    expect(container.querySelector('.recharts-surface')).not.toHaveAttribute('tabindex');
  });

  it('aria-hidden — bezak, role yo‘q; variant="line" — to‘ldirishsiz', () => {
    const { container } = render(
      <Sparkline aria-hidden data={[1, 2, 3]} variant="line" height={24} data-testid="s" />,
    );
    const root = screen.getByTestId('s');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role');
    expect(root.style.height).toBe('24px');
    expect(container.querySelector('.recharts-area-area')).toHaveAttribute('fill', 'none');
  });
});
