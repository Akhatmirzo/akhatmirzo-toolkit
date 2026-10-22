'use client';

import { Field, Input } from '@akhatmirzo/ui';

export default function InputPassword() {
  return (
    <div className="w-full max-w-sm">
      <Field label="Parol" description="Kamida 8 ta belgi">
        <Input type="password" defaultValue="maxfiy123" autoComplete="current-password" />
      </Field>
    </div>
  );
}
