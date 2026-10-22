'use client';

import { Slider } from '@akhatmirzo/ui';

export default function SliderSizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <Slider size="sm" defaultValue={[35]} aria-label="Kichik" />
      <Slider size="md" defaultValue={[65]} aria-label="O'rta" />
      <Slider defaultValue={[50]} disabled aria-label="O'chirilgan" />
    </div>
  );
}
