import { Button, Field, SegmentedControl } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'SegmentedControl', group: 'Tanlov', order: 5 };

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

const sizes = ['sm', 'md', 'lg'] as const;

export default function Page() {
  const [period, setPeriod] = useState('week');

  return (
    <DemoPage
      title="SegmentedControl"
      description="Radix RadioGroup asosida: bitta tanlov, ←→ bilan yurish. Tanlangan fon — bitta suriluvchi indikator (200ms, reduced-motion’da sakraydi)."
    >
      <DemoSection title="Asosiy">
        <SegmentedControl defaultValue="month" aria-label="Davr">
          <SegmentedControl.Item value="day">Kun</SegmentedControl.Item>
          <SegmentedControl.Item value="week">Hafta</SegmentedControl.Item>
          <SegmentedControl.Item value="month">Oy</SegmentedControl.Item>
          <SegmentedControl.Item value="year">Yil</SegmentedControl.Item>
        </SegmentedControl>
      </DemoSection>

      <DemoSection title="O‘lchamlar" description="32 / 40 / 48px — Button bilan bir qatorda tekis">
        {sizes.map((size) => (
          <DemoRow key={size} label={size}>
            <SegmentedControl size={size} defaultValue="all" aria-label={`Holat ${size}`}>
              <SegmentedControl.Item value="all">Hammasi</SegmentedControl.Item>
              <SegmentedControl.Item value="paid">To‘langan</SegmentedControl.Item>
              <SegmentedControl.Item value="debt">Qarz</SegmentedControl.Item>
            </SegmentedControl>
            <Button size={size} variant="outline">
              Eksport
            </Button>
          </DemoRow>
        ))}
      </DemoSection>

      <DemoSection title="Ikonkalar" description="Faqat ikonkali elementda aria-label majburiy">
        <DemoRow>
          <SegmentedControl defaultValue="grid" aria-label="Ko‘rinish">
            <SegmentedControl.Item value="grid" icon={<GridIcon />} aria-label="Katakli" />
            <SegmentedControl.Item value="list" icon={<ListIcon />} aria-label="Ro‘yxat" />
          </SegmentedControl>
          <SegmentedControl defaultValue="list" aria-label="Ko‘rinish">
            <SegmentedControl.Item value="grid" icon={<GridIcon />}>
              Katakli
            </SegmentedControl.Item>
            <SegmentedControl.Item value="list" icon={<ListIcon />}>
              Ro‘yxat
            </SegmentedControl.Item>
          </SegmentedControl>
        </DemoRow>
      </DemoSection>

      <DemoSection title="fullWidth">
        <div className="max-w-md">
          <SegmentedControl fullWidth defaultValue="delivery" aria-label="Olib ketish usuli">
            <SegmentedControl.Item value="delivery">Yetkazib berish</SegmentedControl.Item>
            <SegmentedControl.Item value="pickup">Olib ketish</SegmentedControl.Item>
            <SegmentedControl.Item value="post">Pochta</SegmentedControl.Item>
          </SegmentedControl>
        </div>
      </DemoSection>

      <DemoSection title="Disabled">
        <DemoRow>
          <SegmentedControl defaultValue="card" aria-label="To‘lov usuli">
            <SegmentedControl.Item value="cash">Naqd</SegmentedControl.Item>
            <SegmentedControl.Item value="card">Karta</SegmentedControl.Item>
            <SegmentedControl.Item value="credit" disabled>
              Nasiya
            </SegmentedControl.Item>
          </SegmentedControl>
          <SegmentedControl defaultValue="uz" disabled aria-label="Til">
            <SegmentedControl.Item value="uz">O‘zbekcha</SegmentedControl.Item>
            <SegmentedControl.Item value="ru">Ruscha</SegmentedControl.Item>
          </SegmentedControl>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Field bilan">
        <div className="max-w-md">
          <Field label="Hisobot davri" description="Grafik shu davr bo‘yicha chiziladi">
            <SegmentedControl defaultValue="week">
              <SegmentedControl.Item value="day">Kun</SegmentedControl.Item>
              <SegmentedControl.Item value="week">Hafta</SegmentedControl.Item>
              <SegmentedControl.Item value="month">Oy</SegmentedControl.Item>
            </SegmentedControl>
          </Field>
        </div>
      </DemoSection>

      <DemoSection
        title="Boshqariladigan"
        description={
          <>
            <Code>value</Code> + <Code>onValueChange</Code>
          </>
        }
      >
        <DemoRow>
          <SegmentedControl value={period} onValueChange={setPeriod} aria-label="Davr">
            <SegmentedControl.Item value="day">Kun</SegmentedControl.Item>
            <SegmentedControl.Item value="week">Hafta</SegmentedControl.Item>
            <SegmentedControl.Item value="month">Oy</SegmentedControl.Item>
          </SegmentedControl>
          <span className="text-sm text-text-muted">Tanlangan: {period}</span>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
