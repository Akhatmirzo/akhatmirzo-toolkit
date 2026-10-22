'use client';

import { Field, Switch } from '@akhatmirzo/ui';

export default function SwitchWithField() {
  return (
    <div className="max-w-sm">
      <Field label="Ikki bosqichli tasdiqlash" description="Har kirishda SMS kod so'raladi">
        <Switch />
      </Field>
    </div>
  );
}
