'use client';

import { Checkbox } from '@akhatmirzo/ui';

export default function CheckboxStates() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Checkbox label="O'chirilgan" disabled />
      <Checkbox label="O'chirilgan, belgilangan" disabled defaultChecked />
      <Checkbox label="Xato" invalid />
    </div>
  );
}
