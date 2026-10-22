'use client';

import { Stepper } from '@akhatmirzo/ui';

const steps = [
  { title: 'Savat' },
  { title: 'Yetkazib berish' },
  { title: "To'lov" },
  { title: 'Tasdiqlash' },
];

export default function StepperCompact() {
  return (
    <div className="w-full max-w-xs">
      <Stepper steps={steps} value={1} compact />
    </div>
  );
}
