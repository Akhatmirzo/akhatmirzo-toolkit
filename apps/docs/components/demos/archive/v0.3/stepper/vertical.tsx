'use client';

import { Stepper } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function StepperVertical() {
  const [step, setStep] = useState(1);

  return (
    <Stepper
      orientation="vertical"
      aria-label="Do'konni sozlash"
      value={step}
      onValueChange={setStep}
      allowFutureSteps
      steps={[
        { title: "Do'kon nomi", description: "Mijozlar ko'radigan nom" },
        { title: "To'lov usullari", description: 'Click, Payme, naqd' },
        { title: 'Yetkazib berish', description: 'Hududlar va narxlar' },
        { title: 'Ishga tushirish' },
      ]}
    />
  );
}
