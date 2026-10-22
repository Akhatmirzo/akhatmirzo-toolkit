'use client';

import { debounce, throttle } from '@akhatmirzo/core';
import { Button } from '@akhatmirzo/ui';
import { useEffect, useMemo, useState } from 'react';

type Counts = { raw: number; throttled: number; debounced: number };
const ZERO: Counts = { raw: 0, throttled: 0, debounced: 0 };
const inc = (key: keyof Counts) => (c: Counts) => ({ ...c, [key]: c[key] + 1 });

export default function CoreDebounceThrottle() {
  const [counts, setCounts] = useState(ZERO);

  const onDebounced = useMemo(() => debounce(() => setCounts(inc('debounced')), 400), []);
  const onThrottled = useMemo(() => throttle(() => setCounts(inc('throttled')), 400), []);

  useEffect(
    () => () => {
      onDebounced.cancel();
      onThrottled.cancel();
    },
    [onDebounced, onThrottled],
  );

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div
        onPointerMove={() => {
          setCounts(inc('raw'));
          onDebounced();
          onThrottled();
        }}
        className="flex h-32 touch-none items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted text-sm text-text-muted"
      >
        Sichqoncha yoki barmoqni shu yerda yurgizing
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center text-sm">
        {(['raw', 'throttled', 'debounced'] as const).map((key) => (
          <div key={key} className="rounded-lg border border-border bg-surface p-2">
            <dt className="font-mono text-xs text-text-muted">{key}</dt>
            <dd className="text-xl font-semibold text-text tabular-nums">{counts[key]}</dd>
          </div>
        ))}
      </dl>
      <Button size="sm" variant="ghost" onClick={() => setCounts(ZERO)}>
        Nolga qaytarish
      </Button>
    </div>
  );
}
