'use client';

import { Slider } from '@akhatmirzo/ui';

export default function SliderShowValue() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-10 pt-8">
      <Slider defaultValue={[30]} showValue="active" aria-label="Faol paytda" />
      <Slider defaultValue={[60]} showValue="always" aria-label="Doim" />
      <Slider defaultValue={[80]} showValue="never" aria-label="Hech qachon" />
    </div>
  );
}
