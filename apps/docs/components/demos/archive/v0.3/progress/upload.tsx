'use client';

import { Button, Progress } from '@akhatmirzo/ui';
import { useEffect, useState } from 'react';

export default function ProgressUpload() {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setValue((v) => Math.min(v + 8, 100)), 300);
    return () => clearInterval(id);
  }, [running]);

  const done = value === 100;
  if (done && running) setRunning(false);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Progress value={value} label="hisobot.pdf" showValue color={done ? 'success' : 'primary'} />
      <Button
        size="sm"
        className="self-start"
        disabled={running}
        onClick={() => {
          setValue(0);
          setRunning(true);
        }}
      >
        {done ? 'Qayta yuklash' : 'Yuklashni boshlash'}
      </Button>
    </div>
  );
}
