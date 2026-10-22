'use client';

import { Radio, RadioGroup } from '@akhatmirzo/ui';

export default function RadioGroupHorizontal() {
  return (
    <RadioGroup aria-label="Yetkazib berish" orientation="horizontal" defaultValue="express">
      <Radio value="express" label="Tezkor" />
      <Radio value="standard" label="Oddiy" />
      <Radio value="pickup" label="Olib ketish" />
    </RadioGroup>
  );
}
