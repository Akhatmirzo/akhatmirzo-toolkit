'use client';

import { Radio, RadioGroup } from '@akhatmirzo/ui';

export default function RadioGroupSizes() {
  return (
    <div className="flex flex-wrap items-start gap-10">
      <RadioGroup aria-label="Interfeys tili (kichik)" size="sm" defaultValue="uz">
        <Radio value="uz" label="O'zbekcha" />
        <Radio value="ru" label="Ruscha" description="Kirill yozuvida" />
      </RadioGroup>
      <RadioGroup aria-label="Interfeys tili (o'rta)" defaultValue="uz">
        <Radio value="uz" label="O'zbekcha" />
        <Radio value="ru" label="Ruscha" description="Kirill yozuvida" />
      </RadioGroup>
    </div>
  );
}
