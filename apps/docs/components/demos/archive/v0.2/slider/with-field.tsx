'use client';

import { Field, Slider } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function SliderWithField() {
  const [km, setKm] = useState([45]);

  return (
    <div className="w-full max-w-sm">
      <Field
        label="Yetkazib berish radiusi"
        description="Do'kondan necha km uzoqlikkacha yetkazasiz"
        error={km[0]! > 40 ? "40 km dan uzoqqa kuryer yo'q" : undefined}
      >
        <Slider value={km} onValueChange={setKm} max={60} formatValue={(v) => `${v} km`} />
      </Field>
    </div>
  );
}
