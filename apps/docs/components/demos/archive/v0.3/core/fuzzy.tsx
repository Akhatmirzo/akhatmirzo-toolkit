'use client';

import { fuzzyMatch, splitByRanges } from '@akhatmirzo/core';
import { Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const COMMANDS = [
  'Yangi buyurtma',
  "Buyurtmalar ro'yxati",
  "Mijoz qo'shish",
  'Hisobotlar',
  'Sozlamalar',
  'Profilni tahrirlash',
  'Mavzuni almashtirish',
];

export default function CoreFuzzy() {
  const [query, setQuery] = useState('ybu');
  const results = COMMANDS.flatMap((label) => {
    const result = fuzzyMatch(label, query);
    return result ? [{ label, ...result }] : [];
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Field label="Buyruq" description="Harflar tartibi muhim: mq, hsb, prof">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} clearable />
      </Field>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface text-sm">
        {results.map(({ label, ranges, score }) => (
          <li key={label} className="flex items-center justify-between gap-3 px-3 py-2">
            <span>
              {splitByRanges(label, ranges).map((part, i) =>
                part.match ? (
                  <strong key={i} className="font-semibold text-primary-soft-foreground">
                    {part.text}
                  </strong>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </span>
            <span className="font-mono text-xs text-text-muted">{score}</span>
          </li>
        ))}
        {results.length === 0 && <li className="px-3 py-2 text-text-muted">Mos buyruq yo'q</li>}
      </ul>
    </div>
  );
}
