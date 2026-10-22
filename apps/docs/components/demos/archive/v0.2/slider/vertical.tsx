'use client';

import { Slider } from '@akhatmirzo/ui';

export default function SliderVertical() {
  return (
    <div className="flex h-48 items-stretch gap-10 pl-12">
      <Slider orientation="vertical" defaultValue={[70]} aria-label="Ovoz" />
      <Slider orientation="vertical" defaultValue={[20, 60]} aria-label="Harorat" />
    </div>
  );
}
