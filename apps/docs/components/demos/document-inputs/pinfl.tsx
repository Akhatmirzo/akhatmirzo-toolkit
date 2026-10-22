'use client';

import { Field, PinflInput, type PinflInputDetails } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function PinflDemo() {
  const [details, setDetails] = useState<PinflInputDetails | null>(null);

  const info =
    details?.valid && details.birthDate
      ? `${details.gender === 'male' ? 'Erkak' : 'Ayol'}, tugʻilgan: ${details.birthDate.toLocaleDateString('uz-UZ')}`
      : undefined;

  return (
    <div className="w-full max-w-sm">
      <Field
        label="JShShIR"
        description={info ?? '14 raqam — pasportdagi shaxsiy raqam'}
        error={details && !details.valid ? 'JShShIR notoʻgʻri' : undefined}
      >
        <PinflInput
          onValueChange={(_, d) => {
            if (!d.complete) setDetails(null);
          }}
          onDetails={setDetails}
        />
      </Field>
    </div>
  );
}
