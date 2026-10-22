'use client';

import { isValidEmail, parsePhone } from '@akhatmirzo/core';
import { Badge, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function CorePhoneValidate() {
  const [phone, setPhone] = useState('+998 90 123-45-67');
  const [email, setEmail] = useState('sarvar@mail');
  const parsed = parsePhone(phone);
  const code = parsed.digits.slice(0, 2);
  const phoneError =
    code.length === 2 && !parsed.operator ? `"${code}" — bunday operator kodi yo'q` : undefined;
  const emailValid = isValidEmail(email);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field label="Telefon" error={phoneError} description={`digits: ${parsed.digits || '—'}`}>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Badge color={parsed.valid ? 'success' : 'neutral'} dot>
          {parsed.valid ? "To'g'ri raqam" : "To'liq emas"}
        </Badge>
        {parsed.operator && <Badge color="info">Operator: {parsed.operator}</Badge>}
      </div>
      <Field
        label="Email"
        error={email.trim() && !emailValid ? "Email manzil noto'g'ri" : undefined}
      >
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
    </div>
  );
}
