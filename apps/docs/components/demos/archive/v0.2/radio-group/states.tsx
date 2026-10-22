'use client';

import { Radio, RadioGroup } from '@akhatmirzo/ui';

export default function RadioGroupStates() {
  return (
    <div className="flex flex-wrap items-start gap-10">
      <RadioGroup aria-label="Butun guruh o'chirilgan" disabled defaultValue="a">
        <Radio value="a" label="Tanlangan" />
        <Radio value="b" label="Tanlanmagan" />
      </RadioGroup>
      <RadioGroup aria-label="Bitta variant o'chirilgan">
        <Radio value="a" label="Omborda bor" />
        <Radio value="b" label="Tugagan" disabled />
      </RadioGroup>
      <RadioGroup aria-label="Xato holati" invalid>
        <Radio value="yes" label="Ha" />
        <Radio value="no" label="Yo'q" />
      </RadioGroup>
    </div>
  );
}
