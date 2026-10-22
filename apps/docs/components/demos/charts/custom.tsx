'use client';

import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  axisProps,
  cursorProps,
  gridProps,
  type ChartConfig,
} from '@akhatmirzo/ui/charts';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { month: 'Yan', buyurtma: 820, konversiya: 2.4 },
  { month: 'Fev', buyurtma: 760, konversiya: 2.1 },
  { month: 'Mar', buyurtma: 940, konversiya: 2.8 },
  { month: 'Apr', buyurtma: 1010, konversiya: 3.1 },
  { month: 'May', buyurtma: 1180, konversiya: 3.4 },
];

// Har kalit → `var(--chart-<kalit>)`; label — tooltip va legend'da
const config: ChartConfig = {
  buyurtma: { label: 'Buyurtmalar', color: 'primary' },
  konversiya: { label: 'Konversiya, %', color: 'amber' },
};

export default function ChartsCustom() {
  return (
    <ChartContainer aria-label="Buyurtmalar va konversiya" config={config} className="h-72">
      <ComposedChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" {...axisProps} tickMargin={8} />
        <YAxis yAxisId="left" {...axisProps} width="auto" />
        <YAxis yAxisId="right" orientation="right" {...axisProps} width="auto" />
        <Tooltip cursor={cursorProps} content={<ChartTooltip />} />
        <Legend content={<ChartLegend className="pt-3" />} />
        <Bar yAxisId="left" dataKey="buyurtma" fill="var(--chart-buyurtma)" radius={[6, 6, 0, 0]} />
        <Line
          yAxisId="right"
          dataKey="konversiya"
          stroke="var(--chart-konversiya)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
