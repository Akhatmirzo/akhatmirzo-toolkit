'use client';

import { formatMoney, formatNumber, type MoneyCurrency } from '@akhatmirzo/core';
import { Button, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const CURRENCIES: MoneyCurrency[] = ["so'm", 'UZS', false];

export default function CoreMoney() {
  const [raw, setRaw] = useState('1250000.5');
  const [currency, setCurrency] = useState<MoneyCurrency>("so'm");
  const n = Number(raw.replace(',', '.').replace(/\s/g, ''));

  const rows = [
    { call: 'formatNumber(n)', value: formatNumber(n) },
    { call: 'formatNumber(n, { decimals: 2 })', value: formatNumber(n, { decimals: 2 }) },
    { call: 'formatMoney(n, { currency })', value: formatMoney(n, { currency }) },
  ];

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Field label="Son">
        <Input value={raw} onChange={(e) => setRaw(e.target.value)} inputMode="decimal" />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        {CURRENCIES.map((c) => (
          <Button
            key={String(c)}
            size="sm"
            variant={currency === c ? 'primary' : 'outline'}
            onClick={() => setCurrency(c)}
          >
            {c === false ? 'false' : c}
          </Button>
        ))}
      </div>
      <dl className="divide-y divide-border rounded-xl border border-border bg-surface text-sm">
        {rows.map((row) => (
          <div key={row.call} className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-3 py-2">
            <dt className="font-mono text-xs text-text-muted">{row.call}</dt>
            <dd className="font-mono font-medium text-text tabular-nums">{row.value || "''"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
