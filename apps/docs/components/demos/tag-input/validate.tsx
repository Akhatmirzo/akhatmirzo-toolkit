'use client';

import { isValidEmail } from '@akhatmirzo/core';
import { Field, TagInput } from '@akhatmirzo/ui';

export default function TagInputValidate() {
  return (
    <div className="w-full max-w-md">
      <Field label="Qabul qiluvchilar" description="Bir nechta emailni vergul bilan qo'ying">
        <TagInput
          validate={(email) => isValidEmail(email) || "Email noto'g'ri"}
          transform={(raw) => raw.trim().toLowerCase()}
          placeholder="Email qo'shing"
        />
      </Field>
    </div>
  );
}
