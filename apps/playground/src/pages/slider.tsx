import { formatMoney } from '@akhatmirzo/core';
import { Button, Field, Slider } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Slider', group: 'Tanlov', order: 4 };

const percentMarks = [0, 25, 50, 75, 100].map((value) => ({ value, label: `${value}%` }));

export default function Page() {
  const [price, setPrice] = useState([1_000_000, 3_500_000]);
  const [volume, setVolume] = useState([40]);
  const [committed, setCommitted] = useState([40]);

  return (
    <DemoPage
      title="Slider"
      description="Radix Slider asosida. Qiymat doim massiv: bitta tutqich [50], oraliq [20, 80]. Strelkalar ±step, PageUp/PageDown ±10×step, Home/End."
    >
      <DemoSection title="Asosiy">
        <div className="flex max-w-md flex-col gap-8">
          <Slider defaultValue={[40]} aria-label="Yorqinlik" />
          <Slider defaultValue={[20, 80]} aria-label="Oraliq" />
        </div>
      </DemoSection>

      <DemoSection
        title="Narx oralig‘i"
        description={
          <>
            <Code>formatValue</Code> — pufakcha va <Code>aria-valuetext</Code>;{' '}
            <Code>minStepsBetweenThumbs=2</Code>
          </>
        }
      >
        <div className="flex max-w-md flex-col gap-4">
          <Slider
            value={price}
            onValueChange={setPrice}
            max={5_000_000}
            step={50_000}
            minStepsBetweenThumbs={2}
            formatValue={(v) => formatMoney(v)}
            aria-label="Narx"
          />
          <span className="text-sm text-text-muted tabular-nums">
            {formatMoney(price[0] ?? 0)} — {formatMoney(price[1] ?? 0)}
          </span>
        </div>
      </DemoSection>

      <DemoSection title="showValue" description="active (default) · always · never">
        <div className="flex max-w-md flex-col gap-10 pt-6">
          <Slider defaultValue={[30]} aria-label="active" />
          <Slider defaultValue={[60]} showValue="always" aria-label="always" />
          <Slider defaultValue={[80]} showValue="never" aria-label="never" />
        </div>
      </DemoSection>

      <DemoSection title="Belgilar (marks)">
        <div className="max-w-md">
          <Slider
            defaultValue={[25]}
            step={25}
            marks={percentMarks}
            formatValue={(v) => `${v}%`}
            aria-label="Chegirma"
          />
        </div>
      </DemoSection>

      <DemoSection
        title="O‘lchamlar va holatlar"
        description="sm — trek 4px / tutqich 16px, md — 6px / 20px"
      >
        <DemoGrid min={260}>
          <Slider size="sm" defaultValue={[35]} aria-label="sm" />
          <Slider defaultValue={[65]} aria-label="md" />
          <Slider defaultValue={[50]} disabled aria-label="Disabled" />
          <Slider defaultValue={[50]} invalid aria-label="Invalid" />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Field bilan">
        <DemoGrid min={280}>
          <Field label="Ovoz balandligi" description="0 dan 100 gacha">
            <Slider defaultValue={[70]} />
          </Field>
          <Field label="Yetkazib berish radiusi" error="40 km dan uzoqqa kuryer yo‘q">
            <Slider defaultValue={[45]} max={60} formatValue={(v) => `${v} km`} />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="onValueCommit"
        description="onValueChange — har siljishda, onValueCommit — qo‘yib yuborilganda"
      >
        <div className="flex max-w-md flex-col gap-3">
          <Slider
            value={volume}
            onValueChange={setVolume}
            onValueCommit={setCommitted}
            aria-label="Ovoz"
          />
          <span className="text-sm text-text-muted">
            Joriy: {volume[0]} · Saqlangan: {committed[0]}
          </span>
        </div>
      </DemoSection>

      <DemoSection title="Vertikal">
        <DemoRow>
          <div className="flex h-48 gap-12 pl-12">
            <Slider orientation="vertical" defaultValue={[70]} aria-label="Ovoz" />
            <Slider orientation="vertical" defaultValue={[20, 60]} aria-label="Harorat" />
            <Slider
              orientation="vertical"
              size="sm"
              defaultValue={[50]}
              marks={[
                { value: 0, label: '0' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
              ]}
              aria-label="Belgili"
            />
          </div>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Forma (name)">
        <form
          className="flex max-w-md flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            alert(JSON.stringify(data.getAll('price[]')));
          }}
        >
          <Slider name="price" defaultValue={[10, 90]} aria-label="Narx" />
          <Button type="submit" size="sm" className="self-start">
            Yuborish
          </Button>
        </form>
      </DemoSection>
    </DemoPage>
  );
}
