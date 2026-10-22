'use client';

import { formatDate, parseDate } from '@akhatmirzo/core';
import { Badge, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const PATTERNS = ['dd.MM.yyyy', 'd MMMM yyyy, EEEE', 'd MMM, EEE', 'EEEE, d MMMM [soat] HH:mm'];
const DATE = new Date(2026, 9, 21, 14, 30);

export default function CoreDate() {
  const [pattern, setPattern] = useState('d MMMM yyyy, EEEE');
  const [input, setInput] = useState('31.02.2026');
  const parsed = parseDate(input);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Field
        label="Shablon"
        description={`formatDate(sana, shablon) → ${formatDate(DATE, pattern)}`}
      >
        <Input value={pattern} onChange={(e) => setPattern(e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-2">
        {PATTERNS.map((p) => (
          <button key={p} type="button" onClick={() => setPattern(p)} className="cursor-pointer">
            <Badge variant="outline">{p}</Badge>
          </button>
        ))}
      </div>
      <Field
        label="parseDate (dd.MM.yyyy)"
        description={parsed ? formatDate(parsed, 'EEEE, d MMMM yyyy') : "null — bunday sana yo'q"}
      >
        <Input value={input} onChange={(e) => setInput(e.target.value)} invalid={!parsed} />
      </Field>
    </div>
  );
}
