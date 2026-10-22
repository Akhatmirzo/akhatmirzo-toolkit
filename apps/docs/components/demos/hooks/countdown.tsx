'use client';

import { useCountdown } from '@akhatmirzo/hooks';
import { Button, Field, OtpInput, toast } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function HooksCountdown() {
  const [code, setCode] = useState('');
  const { formatted, isRunning, restart } = useCountdown(59);

  const resend = () => {
    // Haqiqiy ilovada — SMS yuborish so'rovi
    setCode('');
    toast('Yangi kod +998 90 *** ** 67 ga yuborildi');
    restart();
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <Field label="Tasdiqlash kodi" description="+998 90 *** ** 67 ga yuborildi">
        <OtpInput groupSize={3} value={code} onValueChange={setCode} />
      </Field>
      <Button variant="ghost" size="sm" disabled={isRunning} onClick={resend}>
        {isRunning ? `Kodni qayta yuborish (${formatted})` : 'Kodni qayta yuborish'}
      </Button>
    </div>
  );
}
