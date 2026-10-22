'use client';

import { slugify, truncate, truncateMiddle } from '@akhatmirzo/core';
import { Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const FILE = 'shartnoma-mchj-akhatmirzo-imzolangan.docx';

export default function CoreTruncate() {
  const [title, setTitle] = useState("Farg'ona viloyati — 2026");
  const [max, setMax] = useState(24);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Field label="Sarlavha" description={`slugify: ${slugify(title) || '—'}`}>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <label className="flex flex-col gap-2 text-sm font-medium text-text">
        Maksimal uzunlik: {max}
        <input
          type="range"
          min={6}
          max={44}
          value={max}
          onChange={(e) => setMax(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </label>
      <dl className="divide-y divide-border rounded-xl border border-border bg-surface text-sm">
        <div className="flex flex-col gap-1 px-3 py-2">
          <dt className="font-mono text-xs text-text-muted">truncateMiddle</dt>
          <dd className="font-mono text-text">{truncateMiddle(FILE, max)}</dd>
        </div>
        <div className="flex flex-col gap-1 px-3 py-2">
          <dt className="font-mono text-xs text-text-muted">truncate</dt>
          <dd className="font-mono text-text">{truncate(FILE, max)}</dd>
        </div>
      </dl>
    </div>
  );
}
