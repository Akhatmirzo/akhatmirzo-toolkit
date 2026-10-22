'use client';

import { OtpInput } from '@akhatmirzo/ui';

export default function OtpInputStates() {
  return (
    <div className="flex flex-col items-start gap-5">
      <OtpInput invalid defaultValue="482913" groupSize={3} aria-label="Xato kod" />
      <OtpInput disabled defaultValue="12" groupSize={3} aria-label="O'chirilgan" />
    </div>
  );
}
