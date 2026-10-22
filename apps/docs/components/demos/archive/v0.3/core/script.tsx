'use client';

import { detectScript, fixApostrophes, toScript } from '@akhatmirzo/core';
import { Badge, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const SAMPLES = [
  "O'zbekiston g'alabasi, ma'no",
  'Салом, дунё',
  'Toshkent — Тошкент',
  "'Salom' dedi",
];

export default function CoreScript() {
  const [text, setText] = useState("O'zbekiston g'alabasi, ma'no");

  const rows = [
    { name: "toScript(s, 'latin')", value: toScript(text, 'latin') },
    { name: "toScript(s, 'cyrillic')", value: toScript(text, 'cyrillic') },
    { name: 'fixApostrophes', value: fixApostrophes(text) },
  ];

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Field label="Matn">
        <Input value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Badge color="info">detectScript: {detectScript(text)}</Badge>
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
