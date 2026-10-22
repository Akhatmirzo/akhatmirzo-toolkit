'use client';

import { formatDateRange, formatDateUz, formatDuration } from '@akhatmirzo/core';
import { Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const STYLES = ['long', 'full', 'short', 'dayMonth', 'monthYear'] as const;

export default function CoreDateUz() {
  const [value, setValue] = useState('2026-10-22');
  const [y = 2026, m = 10, d = 22] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d, 14, 30);
  const end = new Date(y, m - 1, d + 3);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Field label="Sana">
        <Input type="date" value={value} onChange={(e) => setValue(e.target.value)} />
      </Field>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {STYLES.map((style) => (
          <div key={style} className="contents">
            <dt className="font-mono text-xs text-text-muted">{style}</dt>
            <dd>{formatDateUz(date, { style })}</dd>
          </div>
        ))}
        <dt className="font-mono text-xs text-text-muted">kirill</dt>
        <dd>{formatDateUz(date, { style: 'full', script: 'cyrillic' })}</dd>
        <dt className="font-mono text-xs text-text-muted">+3 kun</dt>
        <dd>{formatDateRange(date, end)}</dd>
        <dt className="font-mono text-xs text-text-muted">davomiylik</dt>
        <dd>{formatDuration(end.getTime() - date.getTime(), { units: 3 })}</dd>
      </dl>
    </div>
  );
}
