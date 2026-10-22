'use client';

import { Field, MoneyInput } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function MoneyWords() {
  const [amount, setAmount] = useState<number | null>(1250000);

  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="Shartnoma summasi">
        <MoneyInput value={amount} onValueChange={setAmount} showWords />
      </Field>
      <Field label="Кирилл, расмий">
        <MoneyInput
          value={amount}
          onValueChange={setAmount}
          showWords={{ script: 'cyrillic', formal: true }}
        />
      </Field>
    </div>
  );
}
