'use client';

import { Slider } from '@akhatmirzo/ui';

const marks = [
  { value: 0, label: '0%' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100%' },
];

export default function SliderMarks() {
  return (
    <div className="w-full max-w-sm">
      <Slider
        defaultValue={[25]}
        step={25}
        marks={marks}
        formatValue={(v) => `${v}%`}
        aria-label="Chegirma"
      />
    </div>
  );
}
