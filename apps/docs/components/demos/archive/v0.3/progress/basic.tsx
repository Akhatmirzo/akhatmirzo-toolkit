'use client';

import { Progress } from '@akhatmirzo/ui';

export default function ProgressBasic() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Progress value={64} label="Yuklanmoqda" showValue />
      <Progress
        value={3}
        max={5}
        label="Profil to'ldirildi"
        showValue
        formatValue={(value, max) => `${value} / ${max}`}
      />
    </div>
  );
}
