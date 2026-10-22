'use client';

import { detectCardBrand, formatCardNumber, isValidCardNumber } from '@akhatmirzo/core';
import { Badge, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const BRANDS = { uzcard: 'Uzcard', humo: 'Humo', visa: 'Visa', mastercard: 'Mastercard' };

export default function CoreCardValidate() {
  const [digits, setDigits] = useState('8600');
  const brand = detectCardBrand(digits);
  const complete = digits.length === 16;
  const valid = isValidCardNumber(digits);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field
        label="Karta raqami"
        description="To'g'ri namuna: 4111 1111 1111 1111"
        error={complete && !valid ? "Karta raqami noto'g'ri" : undefined}
      >
        <Input
          value={formatCardNumber(digits)}
          onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 16))}
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          suffix={brand ? BRANDS[brand] : undefined}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Badge color={brand ? 'info' : 'neutral'}>{brand ? BRANDS[brand] : "Brend noma'lum"}</Badge>
        <Badge color={!complete ? 'neutral' : valid ? 'success' : 'danger'} dot>
          {!complete ? `${digits.length}/16` : valid ? "Luhn: to'g'ri" : 'Luhn: xato'}
        </Badge>
      </div>
    </div>
  );
}
