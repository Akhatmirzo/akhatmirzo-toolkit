'use client';

import { Stepper } from '@akhatmirzo/ui';

const steps = [{ title: 'Savat' }, { title: 'Yetkazib berish' }, { title: "To'lov" }];

export default function StepperSizes() {
  return (
    <div className="flex w-full flex-col gap-8">
      <Stepper steps={steps} defaultValue={1} size="sm" aria-label="Kichik" />
      <Stepper steps={steps} defaultValue={1} aria-label="O'rtacha" />
    </div>
  );
}
