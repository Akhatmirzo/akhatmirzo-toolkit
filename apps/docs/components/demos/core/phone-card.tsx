'use client';

import { formatCardNumber, formatPhone } from '@akhatmirzo/core';
import { Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const digitsOf = (s: string) => s.replace(/\D/g, '');

export default function CorePhoneCard() {
  const [phone, setPhone] = useState('90123');
  const [card, setCard] = useState('8600 1234');

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field label="Telefon" description={`formatPhone: ${formatPhone(phone) || '—'}`}>
        <Input
          prefix="+998"
          value={formatPhone(phone, 'national')}
          onChange={(e) => setPhone(digitsOf(e.target.value).slice(0, 9))}
          inputMode="tel"
          placeholder="(90) 123-45-67"
        />
      </Field>
      <Field label="Karta raqami" description={`Toza qiymat: ${digitsOf(card) || '—'}`}>
        <Input
          value={card}
          onChange={(e) => setCard(formatCardNumber(digitsOf(e.target.value).slice(0, 16)))}
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
        />
      </Field>
    </div>
  );
}
