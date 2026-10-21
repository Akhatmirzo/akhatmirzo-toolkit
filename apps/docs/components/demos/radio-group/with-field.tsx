'use client';

import { Field, Radio, RadioGroup } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function RadioGroupWithField() {
  const [value, setValue] = useState<string>();

  return (
    <Field label="Yetkazib berish" required error={value ? undefined : 'Usulni tanlang'}>
      <RadioGroup value={value} onValueChange={setValue}>
        <Radio value="courier" label="Kuryer" description="Ertaga, 25 000 so'm" />
        <Radio value="pickup" label="Olib ketish" description="Bugun, bepul" />
      </RadioGroup>
    </Field>
  );
}
