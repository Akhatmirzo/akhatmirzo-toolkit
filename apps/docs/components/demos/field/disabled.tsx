'use client';

import { Field, Input } from '@akhatmirzo/ui';

export default function FieldDisabled() {
  return (
    <div className="w-full max-w-sm">
      <Field label="Hudud" description="Hudud administrator tomonidan belgilanadi" disabled>
        <Input defaultValue="Toshkent shahri" />
      </Field>
    </div>
  );
}
