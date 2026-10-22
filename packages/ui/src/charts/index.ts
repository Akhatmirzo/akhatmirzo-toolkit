/**
 * `@akhatmirzo/ui/charts` — alohida kirish nuqtasi. `recharts` (ixtiyoriy peer) faqat shu
 * yerdan import qilinadi; asosiy `@akhatmirzo/ui` uni tortmaydi.
 */

// Primitivlar
export {
  chartColors,
  axisProps,
  gridProps,
  cursorProps,
  resolveChartColor,
  type ChartColor,
  type ChartColorToken,
} from './theme';
export {
  ChartContainer,
  useChartConfig,
  chartVar,
  type ChartContainerProps,
  type ChartConfig,
  type ChartA11yProps,
} from './chart-container';
export { ChartTooltip, type ChartTooltipProps } from './chart-tooltip';
export { ChartLegend, type ChartLegendProps, type ChartLegendItem } from './chart-legend';

// Tayyor grafiklar
export { AreaChart, type AreaChartProps } from './area-chart';
export { BarChart, type BarChartProps, type BarChartOrientation } from './bar-chart';
export { LineChart, type LineChartProps } from './line-chart';
export { DonutChart, type DonutChartProps } from './donut-chart';
export { Sparkline, type SparklineProps } from './sparkline';
export type {
  ChartSeries,
  ChartLabels,
  ChartCurve,
  CartesianChartProps,
  ChartStateProps,
} from './types';
