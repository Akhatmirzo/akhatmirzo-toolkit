'use client';

import { CardInput, Field, MaskedInput, MoneyInput, PhoneInput } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function MaskedInputOverview() {
  const [phone, setPhone] = useState('');
  const [sum, setSum] = useState<number | null>(1250000);
  const [card, setCard] = useState('');
  const [passport, setPassport] = useState('');

  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="Telefon" description={`Qiymat: "${phone}"`}>
        <PhoneInput value={phone} onValueChange={setPhone} />
      </Field>
      <Field label="Summa" description={`Qiymat: ${sum ?? 'null'}`}>
        <MoneyInput value={sum} onValueChange={setSum} />
      </Field>
      <Field label="Karta raqami" description={`Qiymat: "${card}"`}>
        <CardInput value={card} onValueChange={setCard} />
      </Field>
      <Field label="Pasport" description={`Qiymat: "${passport}"`}>
        <MaskedInput
          mask="AA 9999999"
          uppercase
          placeholder="AB 1234567"
          value={passport}
          onValueChange={setPassport}
        />
      </Field>
    </div>
  );
}
