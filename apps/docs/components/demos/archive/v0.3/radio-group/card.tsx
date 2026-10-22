'use client';

import { Radio, RadioGroup } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function RadioGroupCard() {
  const [plan, setPlan] = useState('pro');

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <RadioGroup aria-label="Tarif" variant="card" value={plan} onValueChange={setPlan}>
        <Radio value="free" label="Bepul" description="1 ta do'kon, asosiy imkoniyatlar" />
        <Radio
          value="pro"
          label="Pro · 149 000 so'm"
          description="Cheksiz do'konlar va hisobotlar"
        />
        <Radio value="team" label="Jamoa" description="Tez orada" disabled />
      </RadioGroup>
      <p className="text-sm text-text-muted">Tanlangan tarif: {plan}</p>
    </div>
  );
}
