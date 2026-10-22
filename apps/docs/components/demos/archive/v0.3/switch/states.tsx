'use client';

import { Switch } from '@akhatmirzo/ui';

export default function SwitchStates() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Switch label="O'chirilgan" disabled />
      <Switch label="O'chirilgan, yoqilgan" disabled defaultChecked />
      <Switch label="Xato" invalid />
    </div>
  );
}
