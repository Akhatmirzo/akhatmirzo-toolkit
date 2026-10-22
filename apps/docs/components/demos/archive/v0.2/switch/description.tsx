'use client';

import { Switch } from '@akhatmirzo/ui';

export default function SwitchDescription() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <Switch label="Qorong'i mavzu" description="Tizim sozlamasidan qat'i nazar" defaultChecked />
      <Switch size="sm" label="Ovozli signal" description="Yangi buyurtma kelganda" />
    </div>
  );
}
