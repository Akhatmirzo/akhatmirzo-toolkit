'use client';

import { Stepper } from '@akhatmirzo/ui';

export default function StepperStates() {
  return (
    <Stepper
      aria-label="Ariza"
      value={2}
      className="w-full"
      steps={[
        { title: "Ma'lumotlar" },
        { title: 'Hujjatlar', status: 'error', description: "Pasport rasmi o'qilmadi" },
        { title: 'Tekshiruv' },
        { title: 'Shartnoma' },
      ]}
    />
  );
}
