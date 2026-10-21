'use client';

import { CardInput, Field, getCardDetails } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function CardInputDemo() {
  const [card, setCard] = useState('');
  const { complete, valid, brand } = getCardDetails(card);

  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Field
        label="Karta raqami"
        error={complete && !valid ? "Karta raqami noto'g'ri" : undefined}
        description={
          valid ? `Karta to'g'ri · ${brand ?? 'boshqa'}` : "Sinab ko'ring: 4111 1111 1111 1111"
        }
      >
        <CardInput value={card} onValueChange={setCard} />
      </Field>
      <div className="flex flex-col gap-3">
        <CardInput aria-label="Uzcard" defaultValue="8600123412341234" />
        <CardInput aria-label="Humo" defaultValue="9860010203040506" />
        <CardInput aria-label="Luhn xato" defaultValue="4111111111111112" />
      </div>
    </div>
  );
}
