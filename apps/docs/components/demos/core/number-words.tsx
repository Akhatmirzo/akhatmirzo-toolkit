'use client';

import { moneyToWords, numberToWords, ordinalWords } from '@akhatmirzo/core';
import { Field, Input, SegmentedControl } from '@akhatmirzo/ui';
import { useState } from 'react';

type Script = 'latin' | 'cyrillic';

export default function CoreNumberWords() {
  const [raw, setRaw] = useState('1250000.50');
  const [script, setScript] = useState<Script>('latin');
  const n = Number(raw.replace(',', '.').replace(/\s/g, ''));

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Field label="Summa">
        <Input value={raw} onChange={(e) => setRaw(e.target.value)} inputMode="decimal" />
      </Field>
      <SegmentedControl
        aria-label="Alifbo"
        value={script}
        onValueChange={(v) => setScript(v as Script)}
      >
        <SegmentedControl.Item value="latin">Lotin</SegmentedControl.Item>
        <SegmentedControl.Item value="cyrillic">Кирилл</SegmentedControl.Item>
      </SegmentedControl>
      <dl className="grid gap-2 text-sm">
        <dt className="font-mono text-xs text-text-muted">numberToWords</dt>
        <dd>{numberToWords(n, { script }) || '—'}</dd>
        <dt className="font-mono text-xs text-text-muted">moneyToWords</dt>
        <dd>{moneyToWords(n, { script }) || '—'}</dd>
        <dt className="font-mono text-xs text-text-muted">ordinalWords</dt>
        <dd>{ordinalWords(n, { script }) || '—'}</dd>
      </dl>
    </div>
  );
}
