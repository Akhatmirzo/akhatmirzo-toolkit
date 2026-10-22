'use client';

import { ProgressCircle } from '@akhatmirzo/ui';

export default function ProgressCircleDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <ProgressCircle value={30} size="sm" label="Sinxronlash" />
      <ProgressCircle value={58} showValue label="Saqlash" />
      <ProgressCircle value={72} size="lg" showValue label="Kurs" color="success" />
      <ProgressCircle value={100} size="lg" showValue label="Tayyor" color="success" />
    </div>
  );
}
