'use client';

import { Switch } from '@akhatmirzo/ui';

export default function SwitchBasic() {
  return (
    <div className="flex flex-col gap-4">
      <Switch label="Bildirishnomalar" defaultChecked />
      <Switch label="Avtomatik saqlash" />
    </div>
  );
}
