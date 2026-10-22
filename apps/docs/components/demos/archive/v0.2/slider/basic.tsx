'use client';

import { Slider } from '@akhatmirzo/ui';

export default function SliderBasic() {
  return (
    <div className="w-full max-w-sm">
      <Slider defaultValue={[40]} aria-label="Yorqinlik" />
    </div>
  );
}
