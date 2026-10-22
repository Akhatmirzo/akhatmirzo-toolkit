import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '../lib/cn';
import { resolveChartColor, type ChartColor } from './theme';

/**
 * Grafikning nomi ekran o'quvchi uchun majburiy: `aria-label` yoki `title`.
 * `title` HTML tooltip sifatida emas, faqat accessible nom sifatida ishlatiladi.
 */
export type ChartA11yProps =
  { 'aria-label': string; title?: string } | { title: string; 'aria-label'?: string };

/** Seriyalar sozlamasi: kalit → nom va rang (`--chart-<kalit>` CSS o'zgaruvchisi bo'ladi) */
export type ChartConfig = Record<string, { label?: ReactNode; color?: ChartColor }>;

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = createContext<ChartContextValue>({ config: {} });

/** `ChartContainer` ichidagi `config` — o'z tooltip/legend komponentlaringiz uchun */
export function useChartConfig(): ChartConfig {
  return useContext(ChartContext).config;
}

/** `config` kalitidan CSS o'zgaruvchi nomi: `tushum` → `--chart-tushum` */
export function chartVar(key: string): string {
  return `--chart-${key.replace(/[^\w-]/g, '-')}`;
}

export type ChartContainerProps = Omit<
  ComponentProps<'div'>,
  'title' | 'aria-label' | 'role' | 'children'
> &
  ChartA11yProps & {
    /** Recharts grafigi (`<AreaChart>`, `<BarChart>` ...) */
    children: ReactNode;
    /** Seriyalar: `{ tushum: { label: 'Tushum', color: 'primary' } }` → `var(--chart-tushum)` */
    config?: ChartConfig;
    /** Balandlik (px yoki CSS qiymat). Berilmasa — 280px (`className="h-72"` bilan almashtiring) */
    height?: number | string;
    /** Ekran o'quvchi uchun qisqa xulosa (`aria-describedby`) */
    description?: ReactNode;
  };

/**
 * Responsiv o'rovchi: Recharts grafigini kenglikka moslaydi, `config` ranglarini CSS
 * o'zgaruvchilarga aylantiradi va `role="figure"` + `aria-label` beradi.
 * `role="img"` emas: ichidagi Recharts `accessibilityLayer` yuzasi (`role="application"`,
 * `tabIndex=0`) klaviatura bilan boshqariladi — `img` esa bolalarini "taqdimot"ga aylantiradi
 * (nested-interactive). `figure` interaktiv bolalarga ruxsat beradi.
 */
export function ChartContainer({
  children,
  config = {},
  height,
  description,
  title,
  'aria-label': ariaLabel,
  className,
  style,
  ...props
}: ChartContainerProps) {
  const descriptionId = useId();
  const vars: Record<string, string> = {};
  Object.entries(config).forEach(([key, item], i) => {
    vars[chartVar(key)] = resolveChartColor(item.color, i);
  });

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        role="figure"
        aria-label={ariaLabel ?? title}
        aria-describedby={description != null ? descriptionId : undefined}
        data-slot="chart"
        className={cn(
          'relative h-70 w-full min-w-0 font-sans text-xs text-text',
          // Recharts fokus halqasi o'rniga kutubxona halqasi
          '[&_.recharts-surface]:outline-none [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-offset-2 [&_.recharts-surface:focus-visible]:outline-ring',
          className,
        )}
        style={{ ...vars, ...(height != null ? { height } : null), ...style } as CSSProperties}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
        {description != null && (
          <span id={descriptionId} className="sr-only">
            {description}
          </span>
        )}
      </div>
    </ChartContext.Provider>
  );
}
