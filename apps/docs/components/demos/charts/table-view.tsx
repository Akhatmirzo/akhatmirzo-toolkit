'use client';

import { formatMoney } from '@akhatmirzo/core';
import { SegmentedControl } from '@akhatmirzo/ui';
import { BarChart } from '@akhatmirzo/ui/charts';
import { useState } from 'react';

const data = [
  { quarter: 'I chorak', tushum: 132_600_000 },
  { quarter: 'II chorak', tushum: 169_200_000 },
  { quarter: 'III chorak', tushum: 151_800_000 },
];

export default function ChartsTableView() {
  const [view, setView] = useState('chart');
  return (
    <div className="flex w-full flex-col gap-4">
      <SegmentedControl value={view} onValueChange={setView} aria-label="Ko'rinish" size="sm">
        <SegmentedControl.Item value="chart">Grafik</SegmentedControl.Item>
        <SegmentedControl.Item value="table">Jadval</SegmentedControl.Item>
      </SegmentedControl>
      {view === 'chart' ? (
        <BarChart
          aria-label="Choraklar bo'yicha tushum"
          data={data}
          index="quarter"
          series={[{ key: 'tushum', label: 'Tushum' }]}
          valueFormat={(v) => formatMoney(v)}
          legend={false}
          height={220}
        />
      ) : (
        <table className="w-full text-sm">
          <caption className="sr-only">Choraklar bo&apos;yicha tushum</caption>
          <thead className="text-left text-text-muted">
            <tr>
              <th className="py-2 font-medium">Chorak</th>
              <th className="py-2 text-right font-medium">Tushum</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.quarter} className="border-t border-border">
                <td className="py-2">{row.quarter}</td>
                <td className="py-2 text-right tabular-nums">{formatMoney(row.tushum)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
