'use client';

import { Checkbox, Field } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function CheckboxWithField() {
  const [agree, setAgree] = useState(false);

  return (
    <div className="max-w-sm">
      <Field
        label="Foydalanish shartlari"
        required
        error={agree ? undefined : 'Davom etish uchun rozilik kerak'}
      >
        <Checkbox label="Shartlar bilan tanishdim" checked={agree} onCheckedChange={setAgree} />
      </Field>
    </div>
  );
}
