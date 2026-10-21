'use client';

import { cyrToLat, latToCyr, normalizeUz } from '@akhatmirzo/core';
import { Badge, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const SAMPLES = ['Ғузор тумани', "O'zbekiston", 'Gʻuzor', 'ер, поезд, маъно', 'SHAHAR'];

export default function CoreTranslit() {
  const [text, setText] = useState('Ғузор тумани');

  const rows = [
    { name: 'cyrToLat', value: cyrToLat(text) },
    { name: 'latToCyr', value: latToCyr(text) },
    { name: 'normalizeUz', value: normalizeUz(text) },
  ];

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Field label="Matn">
        <Input value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <button key={s} type="button" onClick={() => setText(s)} className="cursor-pointer">
            <Badge variant="outline">{s}</Badge>
          </button>
        ))}
      </div>
      <dl className="divide-y divide-border rounded-xl border border-border bg-surface text-sm">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-4 px-3 py-2">
            <dt className="font-mono text-xs text-text-muted">{row.name}</dt>
            <dd className="font-mono break-all text-text">{row.value || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
