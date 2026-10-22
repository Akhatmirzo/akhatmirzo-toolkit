'use client';

import { OtpInput } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function OtpInputLength() {
  const [promo, setPromo] = useState('');

  return (
    <div className="flex flex-col items-start gap-5">
      <OtpInput length={4} aria-label="4 xonali PIN" />
      <OtpInput length={6} groupSize={2} aria-label="Juft guruhli kod" />
      <div className="flex flex-col gap-2">
        <OtpInput
          type="alphanumeric"
          groupSize={3}
          aria-label="Harfli kod"
          value={promo}
          onValueChange={setPromo}
        />
        <span className="text-sm text-text-muted">Qiymat: {promo || '—'}</span>
      </div>
    </div>
  );
}
