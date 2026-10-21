import { cn } from '@akhatmirzo/ui';
import { useEffect, useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Tokenlar', group: 'Tokenlar', order: 0 };

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

const semantic: { token: string; note: string }[] = [
  { token: 'background', note: 'Sahifa foni' },
  { token: 'surface', note: 'Karta, modal, input' },
  { token: 'surface-muted', note: 'Hover, ikkilamchi fon' },
  { token: 'surface-raised', note: 'Popover, toast' },
  { token: 'border', note: 'Oddiy chegara' },
  { token: 'border-strong', note: 'Hover chegara' },
  { token: 'text', note: 'Asosiy matn' },
  { token: 'text-subtle', note: 'Ghost tugma, ikonka' },
  { token: 'text-muted', note: 'Yordamchi matn' },
  { token: 'text-faint', note: 'Placeholder' },
  { token: 'primary', note: 'Asosiy tugma' },
  { token: 'primary-hover', note: 'Asosiy tugma hover' },
  { token: 'primary-foreground', note: 'Primary ustidagi matn' },
  { token: 'primary-soft', note: 'Soft tugma, badge' },
  { token: 'primary-soft-hover', note: 'Soft tugma hover' },
  { token: 'primary-soft-foreground', note: 'Soft matni' },
  { token: 'ring', note: 'Fokus halqasi' },
  { token: 'danger', note: 'Xavfli tugma' },
  { token: 'danger-hover', note: 'Xavfli tugma hover' },
  { token: 'danger-ring', note: 'Xato fokusi' },
];

const statuses = [
  {
    name: 'success',
    soft: 'bg-success-soft text-success-soft-foreground',
    dot: 'bg-success',
    solid: 'bg-success text-success-foreground',
  },
  {
    name: 'warning',
    soft: 'bg-warning-soft text-warning-soft-foreground',
    dot: 'bg-warning',
    solid: 'bg-warning text-warning-foreground',
  },
  {
    name: 'danger',
    soft: 'bg-danger-soft text-danger-soft-foreground',
    dot: 'bg-danger',
    solid: 'bg-danger text-danger-foreground',
  },
  {
    name: 'info',
    soft: 'bg-info-soft text-info-soft-foreground',
    dot: 'bg-info',
    solid: 'bg-info text-info-foreground',
  },
];

const typeScale = [
  { cls: 'text-xs font-medium', name: 'text-xs', spec: '12 / 16 · 500' },
  { cls: 'text-sm', name: 'text-sm', spec: '14 / 20 · 400–500' },
  { cls: 'text-base', name: 'text-base', spec: '16 / 24 · 400' },
  { cls: 'text-lg font-medium', name: 'text-lg', spec: '18 / 28 · 500' },
  { cls: 'text-xl font-semibold', name: 'text-xl', spec: '20 / 28 · 600 · -0.01em' },
  { cls: 'text-2xl font-semibold', name: 'text-2xl', spec: '24 / 32 · 600 · -0.01em' },
  { cls: 'text-3xl font-bold', name: 'text-3xl', spec: '30 / 36 · 700 · -0.02em' },
  { cls: 'text-4xl font-bold', name: 'text-4xl', spec: '36 / 40 · 700 · -0.02em' },
];

const radii = [
  { cls: 'rounded-sm', label: '6px' },
  { cls: 'rounded-md', label: '8px' },
  { cls: 'rounded-lg', label: '12px' },
  { cls: 'rounded-xl', label: '16px' },
  { cls: 'rounded-2xl', label: '20px' },
  { cls: 'rounded-full', label: '9999' },
];

const shadows = [
  { cls: 'shadow-xs', note: 'Input, tugma' },
  { cls: 'shadow-sm', note: 'Karta' },
  { cls: 'shadow-md', note: 'Dropdown' },
  { cls: 'shadow-lg', note: 'Popover, toast' },
  { cls: 'shadow-xl', note: 'Modal, drawer' },
];

const durations = [
  { name: 'fast', ms: 100, note: 'Hover, press, yopilish' },
  { name: 'base', ms: 150, note: 'Dropdown, tooltip' },
  { name: 'moderate', ms: 200, note: 'Modal, accordion, tabs' },
  { name: 'slow', ms: 300, note: 'Drawer, toast' },
];

const easings = [
  { cls: 'ease-out', note: 'Kirishlar (asosiy)' },
  { cls: 'ease-in', note: 'Chiqishlar' },
  { cls: 'ease-in-out', note: "Joyida o'zgarish" },
  { cls: 'ease-spring', note: 'Toast, switch' },
];

const zLayers = [
  { name: 'dropdown', value: 1000 },
  { name: 'overlay', value: 1100 },
  { name: 'modal', value: 1110 },
  { name: 'toast', value: 1200 },
  { name: 'tooltip', value: 1300 },
];

/** CSS o'zgaruvchilarning joriy qiymati (mavzu almashganda yangilanadi) */
function useCssVars(names: string[]) {
  const key = names.join(',');
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      setValues(
        Object.fromEntries(key.split(',').map((n) => [n, style.getPropertyValue(n).trim()])),
      );
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [key]);

  return values;
}

function Palette({ name }: { name: string }) {
  const vars = STEPS.map((s) => `--ak-${name}-${s}`);
  const values = useCssVars(vars);
  return (
    <DemoRow label={name}>
      <div className="grid w-full grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
        {vars.map((v, i) => (
          <div key={v} className="flex flex-col gap-1.5">
            <div
              className="h-12 rounded-md border border-border"
              style={{ background: `var(${v})` }}
            />
            <div className="flex flex-col text-xs">
              <span className="font-medium text-text">{STEPS[i]}</span>
              <span className="font-mono text-text-muted uppercase">{values[v]}</span>
            </div>
          </div>
        ))}
      </div>
    </DemoRow>
  );
}

function SemanticColors() {
  const vars = semantic.map((s) => `--ak-${s.token}`);
  const values = useCssVars(vars);
  return (
    <DemoGrid min={220}>
      {semantic.map((s) => {
        const v = `--ak-${s.token}`;
        return (
          <div key={s.token} className="flex items-center gap-3">
            <div
              className="size-10 shrink-0 rounded-lg border border-border"
              style={{ background: `var(${v})` }}
            />
            <div className="flex min-w-0 flex-col text-xs">
              <span className="truncate font-medium text-text">{s.token}</span>
              <span className="truncate text-text-muted">{s.note}</span>
              <span className="truncate font-mono text-text-faint">{values[v]}</span>
            </div>
          </div>
        );
      })}
    </DemoGrid>
  );
}

function MotionDemo() {
  const [on, setOn] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className="focus-ring h-8 w-fit cursor-pointer rounded-lg border-0 bg-primary-soft px-3 font-sans text-sm font-medium text-primary-soft-foreground transition-colors duration-base hover:bg-primary-soft-hover"
      >
        {on ? 'Qaytarish' : 'Ishga tushirish'}
      </button>
      <div className="flex flex-col gap-3">
        {easings.map((e) => (
          <div key={e.cls} className="flex items-center gap-3">
            <div className="flex w-28 shrink-0 flex-col text-xs">
              <span className="font-mono text-text">{e.cls}</span>
              <span className="text-text-muted">{e.note}</span>
            </div>
            <div className="relative h-6 flex-1 rounded-full bg-surface-muted">
              {/* Siljituvchi qatlam kengligi = yo'lak − sharcha, shuning uchun translate-x-full oxirigacha olib boradi */}
              <div
                className={cn(
                  'absolute inset-y-0 left-0 w-[calc(100%-1.5rem)] transition-transform duration-slow',
                  e.cls,
                  on && 'translate-x-full',
                )}
              >
                <div className="size-6 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="Tokenlar"
      description={
        <>
          Manba — <Code>@akhatmirzo/tokens/theme.css</Code>. Komponentlar faqat semantik tokenlarni
          ishlatadi; bazaviy shkalalar to'g'ridan-to'g'ri ishlatilmaydi. Mavzuni almashtirib
          ko'ring.
        </>
      }
    >
      <DemoSection title="Palitralar" description="Bazaviy shkalalar: --ak-indigo-*, --ak-slate-*">
        <Palette name="indigo" />
        <Palette name="slate" />
      </DemoSection>

      <DemoSection
        title="Semantik ranglar"
        description={
          <>
            Tailwind'da: <Code>bg-surface</Code>, <Code>text-text-muted</Code>,{' '}
            <Code>border-border-strong</Code> ... CSS'da: <Code>var(--ak-surface)</Code>
          </>
        }
      >
        <SemanticColors />
      </DemoSection>

      <DemoSection
        title="Status ranglari"
        description="soft — badge va alert foni, solid — nuqta va solid badge"
      >
        <DemoRow label="soft">
          {statuses.map((s) => (
            <span
              key={s.name}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                s.soft,
              )}
            >
              <span className={cn('size-1.5 rounded-full', s.dot)} />
              {s.name}
            </span>
          ))}
        </DemoRow>
        <DemoRow label="solid">
          {statuses.map((s) => (
            <span
              key={s.name}
              className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', s.solid)}
            >
              {s.name}
            </span>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Tipografiya"
        description="Manrope · o'lcham / qator balandligi · qalinlik · letter-spacing"
      >
        <div className="flex flex-col gap-4">
          {typeScale.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <div className="flex shrink-0 flex-col sm:w-44">
                <span className="font-mono text-xs text-text">{t.name}</span>
                <span className="text-xs text-text-muted">{t.spec}</span>
              </div>
              <p className={cn('min-w-0 truncate text-text', t.cls)}>Oʻzbekiston — goʻzal yurt</p>
            </div>
          ))}
          <p className="font-mono text-sm text-text-muted">
            font-mono · 0123456789 · const x = 42;
          </p>
          <p className="text-sm text-text-muted tabular-nums">
            tabular-nums · 1 111 111 so'm · 9 999 999 so'm
          </p>
        </div>
      </DemoSection>

      <DemoSection title="Radius" description="Tugma va input — lg, karta — xl, modal — 2xl">
        <DemoRow>
          {radii.map((r) => (
            <div key={r.cls} className="flex flex-col items-center gap-2">
              <div className={cn('size-16 border border-primary bg-primary-soft', r.cls)} />
              <span className="font-mono text-xs text-text-muted">{r.cls}</span>
              <span className="text-xs text-text-faint">{r.label}</span>
            </div>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Soyalar"
        description="Dark mode'da xs–sm faqat qora soya, md–xl 1px halqa + soya"
        className="bg-background"
      >
        <DemoGrid min={140}>
          {shadows.map((s) => (
            <div
              key={s.cls}
              className={cn('flex h-24 flex-col justify-end rounded-xl bg-surface p-3', s.cls)}
            >
              <span className="font-mono text-xs text-text">{s.cls}</span>
              <span className="text-xs text-text-muted">{s.note}</span>
            </div>
          ))}
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Animatsiya"
        description="Easing tokenlari (300ms, duration-slow) — tugmani bosing"
      >
        <MotionDemo />
        <DemoRow label="Davomiylik — duration-fast · base · moderate · slow yoki var(--ak-duration-*)">
          <DemoGrid min={160} className="w-full">
            {durations.map((d) => (
              <div key={d.name} className="flex flex-col rounded-lg bg-surface-muted p-3 text-xs">
                <span className="font-mono text-text">duration-{d.name}</span>
                <span className="text-text-muted">
                  {d.ms}ms · {d.note}
                </span>
              </div>
            ))}
          </DemoGrid>
        </DemoRow>
        <DemoRow label="Z-index — z-(--ak-z-*)">
          {zLayers.map((z) => (
            <span
              key={z.name}
              className="rounded-md bg-surface-muted px-2 py-1 font-mono text-xs text-text"
            >
              {z.name} · {z.value}
            </span>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Fokus"
        description="focus-ring — faqat klaviatura (Tab) bilan; focus-ring-within — input konteynerlari"
      >
        <DemoRow>
          <button
            type="button"
            className="focus-ring h-10 cursor-pointer rounded-lg border-0 bg-primary px-4 font-sans text-sm font-medium text-primary-foreground"
          >
            focus-ring
          </button>
          <label className="focus-ring-within flex h-10 items-center rounded-lg border border-border bg-surface px-3 text-sm transition-[border-color,box-shadow] duration-base hover:border-border-strong">
            <input
              placeholder="focus-ring-within"
              className="h-full min-w-0 bg-transparent font-sans text-text outline-none placeholder:text-text-faint"
            />
          </label>
          <label
            data-invalid=""
            className="focus-ring-within flex h-10 items-center rounded-lg border border-danger bg-surface px-3 text-sm transition-[border-color,box-shadow] duration-base"
          >
            <input
              aria-invalid="true"
              placeholder="Xato holati"
              className="h-full min-w-0 bg-transparent font-sans text-text outline-none placeholder:text-text-faint"
            />
          </label>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
