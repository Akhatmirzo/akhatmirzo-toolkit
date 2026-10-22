'use client';

import { Radio, RadioGroup } from '@akhatmirzo/ui';

export default function RadioGroupBasic() {
  return (
    <RadioGroup aria-label="To'lov usuli" defaultValue="click">
      <Radio value="click" label="Click" />
      <Radio value="payme" label="Payme" />
      <Radio value="cash" label="Naqd pul" />
    </RadioGroup>
  );
}
