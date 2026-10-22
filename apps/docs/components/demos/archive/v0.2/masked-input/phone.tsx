'use client';

import { Field, PhoneInput, type PhoneInputDetails } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function PhoneInputDemo() {
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState<PhoneInputDetails | null>(null);

  const badOperator = phone.length >= 2 && !details?.operator;

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Field
        label="Telefon raqami"
        required
        error={badOperator ? `"${phone.slice(0, 2)}" — bunday operator kodi yo'q` : undefined}
        description={
          details?.valid ? `Operator: ${details.operator}` : '+998 90 123 45 67 ni joylang'
        }
      >
        <PhoneInput
          value={phone}
          onValueChange={(value, info) => {
            setPhone(value);
            setDetails(info);
          }}
        />
      </Field>
      <PhoneInput aria-label="Kichik" size="sm" defaultValue="991234567" />
      <PhoneInput aria-label="Faqat o'qish" readOnly defaultValue="935554433" />
    </div>
  );
}
