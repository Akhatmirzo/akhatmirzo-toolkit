'use client';

import { useControllableState } from '@akhatmirzo/hooks';
import { Button } from '@akhatmirzo/ui';
import { useState } from 'react';

interface StepperProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

function Stepper({ value, defaultValue = 0, onValueChange }: StepperProps) {
  const [count, setCount] = useControllableState({ value, defaultValue, onChange: onValueChange });
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => setCount((n) => n - 1)}>
        −
      </Button>
      <span className="min-w-8 text-center font-semibold text-text tabular-nums">{count}</span>
      <Button size="sm" variant="outline" onClick={() => setCount((n) => n + 1)}>
        +
      </Button>
    </div>
  );
}

export default function HooksControllableState() {
  const [value, setValue] = useState(10);

  return (
    <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-text-muted">Boshqarilmaydigan (defaultValue=3)</p>
        <Stepper defaultValue={3} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-text-muted">Boshqariladigan (0…20)</p>
        <Stepper value={value} onValueChange={(v) => setValue(Math.min(20, Math.max(0, v)))} />
      </div>
    </div>
  );
}
