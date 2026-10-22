'use client';

import { useInterval } from '@akhatmirzo/hooks';
import { Button } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function HooksInterval() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  // null — interval to'xtaydi
  useInterval(() => setSeconds((s) => s + 1), running ? 1000 : null);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-3xl font-semibold tabular-nums text-text">
        {mm}:{ss}
      </span>
      <div className="flex gap-2">
        <Button variant="primary" onClick={() => setRunning((r) => !r)}>
          {running ? "To'xtatish" : 'Davom ettirish'}
        </Button>
        <Button variant="ghost" onClick={() => setSeconds(0)}>
          Nolga qaytarish
        </Button>
      </div>
    </div>
  );
}
