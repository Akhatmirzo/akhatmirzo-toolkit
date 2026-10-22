'use client';

import { formatMoney } from '@akhatmirzo/core';
import { Slider } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function SliderRange() {
  const [price, setPrice] = useState([1_000_000, 3_500_000]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Slider
        value={price}
        onValueChange={setPrice}
        min={0}
        max={5_000_000}
        step={50_000}
        minStepsBetweenThumbs={2}
        formatValue={(v) => formatMoney(v)}
        aria-label="Narx"
      />
      <p className="m-0 text-sm text-text-muted">
        Narx:{' '}
        <span className="font-semibold text-text tabular-nums">
          {formatMoney(price[0]!)} — {formatMoney(price[1]!)}
        </span>
      </p>
    </div>
  );
}
