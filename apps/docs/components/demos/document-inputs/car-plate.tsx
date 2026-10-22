'use client';

import { CarPlateInput, Field, type CarPlateInputDetails } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function CarPlateDemo() {
  const [details, setDetails] = useState<CarPlateInputDetails | null>(null);

  const type =
    details?.type === 'legal' ? 'yuridik shaxs' : details?.type ? 'jismoniy shaxs' : null;
  const description = [details?.region?.name, type].filter(Boolean).join(' · ');

  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="Jismoniy shaxs" description={description || '01 A 123 BC'}>
        <CarPlateInput defaultValue="01A123BC" onDetails={setDetails} />
      </Field>
      <Field label="Yuridik shaxs" description="01 123 ABC">
        <CarPlateInput defaultValue="30123ABC" />
      </Field>
    </div>
  );
}
