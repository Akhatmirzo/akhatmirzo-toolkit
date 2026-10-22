'use client';

import { Field, OtpInput, toast } from '@akhatmirzo/ui';
import { useState } from 'react';

const CORRECT = '123456';

export default function OtpInputVerify() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'ok'>('idle');

  return (
    <div className="flex flex-col gap-2">
      <Field
        label="Tasdiqlash kodi"
        description={
          status === 'ok' ? 'Kod tasdiqlandi' : `+998 90 *** ** 67 ga yuborildi. Kod: ${CORRECT}`
        }
        error={status === 'error' ? "Kod noto'g'ri. Qayta urinib ko'ring." : undefined}
      >
        <OtpInput
          groupSize={3}
          value={code}
          disabled={status === 'ok'}
          onValueChange={(value) => {
            setCode(value);
            if (status === 'error') setStatus('idle');
          }}
          onComplete={(value) => setStatus(value === CORRECT ? 'ok' : 'error')}
        />
      </Field>
      <OtpInput.ResendTimer
        onResend={() => {
          setCode('');
          setStatus('idle');
          toast('Yangi kod yuborildi');
        }}
      />
    </div>
  );
}
