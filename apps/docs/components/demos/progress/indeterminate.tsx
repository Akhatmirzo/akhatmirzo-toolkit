'use client';

import { Progress, ProgressCircle } from '@akhatmirzo/ui';

export default function ProgressIndeterminate() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Progress value={null} label="Fayl tayyorlanmoqda" />
      <ProgressCircle value={null} label="Yuklanmoqda" />
    </div>
  );
}
