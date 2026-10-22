'use client';

import { Field, MoneyInput } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function MoneyInputDemo() {
  const [price, setPrice] = useState<number | null>(null);

  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="Narx" description={`Qiymat: ${price ?? 'null'}`}>
        <MoneyInput value={price} onValueChange={setPrice} clearable />
      </Field>
      <Field label="Kurs" description='decimals={2}, currency="$"'>
        <MoneyInput decimals={2} currency="$" defaultValue={12.5} />
      </Field>
      <Field label="Oylik to'lov" description="100 000 dan 50 000 000 gacha">
        <MoneyInput min={100000} max={50000000} />
      </Field>
      <Field label="Valyutasiz" description="currency={null}">
        <MoneyInput currency={null} defaultValue={980000} />
      </Field>
    </div>
  );
}
