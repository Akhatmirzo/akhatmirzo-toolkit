'use client';

import { Button, Stepper } from '@akhatmirzo/ui';
import { useState } from 'react';

const steps = [
  { title: 'Savat' },
  { title: 'Yetkazib berish', description: 'Manzil va vaqt' },
  { title: "To'lov" },
  { title: 'Tasdiqlash', optional: true },
];

export default function StepperBasic() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex w-full flex-col gap-6">
      <Stepper steps={steps} value={step} onValueChange={setStep} aria-label="Buyurtma" />
      <div className="flex gap-2">
        <Button size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Orqaga
        </Button>
        <Button
          size="sm"
          variant="primary"
          disabled={step === steps.length}
          onClick={() => setStep(step + 1)}
        >
          Davom etish
        </Button>
      </div>
    </div>
  );
}
