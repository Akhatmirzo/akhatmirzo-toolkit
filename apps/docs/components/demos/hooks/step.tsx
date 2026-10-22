'use client';

import { useStep } from '@akhatmirzo/hooks';
import { Button, Progress, Stepper, toast } from '@akhatmirzo/ui';

const steps = [
  { title: 'Savat' },
  { title: 'Yetkazib berish', description: 'Manzil va vaqt' },
  { title: "To'lov" },
  { title: 'Tasdiqlash' },
];

export default function HooksStep() {
  const { step, next, prev, goTo, reset, isFirst, isLast, progress } = useStep(steps.length);

  return (
    <div className="flex w-full flex-col gap-6">
      <Stepper steps={steps} value={step} onValueChange={goTo} aria-label="Buyurtma" />
      <Progress value={progress * 100} aria-label="Jarayon" />
      <div className="flex gap-2">
        <Button size="sm" disabled={isFirst} onClick={prev}>
          Orqaga
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            if (!isLast) return next();
            toast('Buyurtma qabul qilindi');
            reset();
          }}
        >
          {isLast ? 'Buyurtma berish' : 'Davom etish'}
        </Button>
      </div>
    </div>
  );
}
