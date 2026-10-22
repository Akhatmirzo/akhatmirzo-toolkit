'use client';

import { OtpInput, toast } from '@akhatmirzo/ui';

const sendSms = () =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      toast('SMS qayta yuborildi');
      resolve();
    }, 800);
  });

export default function OtpResendTimer() {
  return (
    <div className="flex flex-col items-start gap-3">
      <OtpInput.ResendTimer seconds={5} onResend={() => toast('Kod qayta yuborildi')} />
      <OtpInput.ResendTimer
        seconds={3}
        labels={{ resend: 'SMS ni qayta olish' }}
        onResend={sendSms}
      />
    </div>
  );
}
