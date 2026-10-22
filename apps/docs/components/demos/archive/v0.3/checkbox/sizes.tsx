'use client';

import { Checkbox } from '@akhatmirzo/ui';

export default function CheckboxSizes() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Checkbox size="sm" label="Kichik · 16" defaultChecked />
      <Checkbox size="md" label="O'rta · 20" defaultChecked />
    </div>
  );
}
