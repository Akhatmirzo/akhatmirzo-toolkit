'use client';

import { Switch } from '@akhatmirzo/ui';

export default function SwitchSizes() {
  return (
    <div className="flex flex-wrap items-start gap-8">
      <Switch size="sm" label="Kichik · 32×18" defaultChecked />
      <Switch size="md" label="O'rta · 40×24" defaultChecked />
    </div>
  );
}
