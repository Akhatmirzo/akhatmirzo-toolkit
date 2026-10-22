'use client';

import { timeAgo } from '@akhatmirzo/core';
import { Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const MINUTE = 60_000;
const NOW = new Date(2026, 9, 21, 12, 0);
const OFFSETS = [5, 180, 1440, 4320, 20160, 136800, -120, -1440];

export default function CoreTimeAgo() {
  const [minutes, setMinutes] = useState('90');
  const custom = new Date(NOW.getTime() - Number(minutes || 0) * MINUTE);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field label="Necha daqiqa oldin" description={`timeAgo → ${timeAgo(custom, NOW)}`}>
        <Input
          value={minutes}
          onChange={(e) => setMinutes(e.target.value.replace(/[^\d-]/g, ''))}
          inputMode="numeric"
          suffix="daqiqa"
        />
      </Field>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface text-sm">
        {OFFSETS.map((m) => (
          <li key={m} className="flex justify-between gap-4 px-3 py-2">
            <span className="font-mono text-xs text-text-muted">{m} daqiqa</span>
            <span className="text-text">{timeAgo(NOW.getTime() - m * MINUTE, NOW)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
