'use client';

import { Field, InnInput, PassportInput } from '@akhatmirzo/ui';

export default function DocumentValidation() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="STIR" description="0 bilan boshlanmaydi — darhol xato">
        <InnInput defaultValue="012345678" />
      </Field>
      <Field label="Pasport" description="validate={false} — tekshiruvsiz">
        <PassportInput defaultValue="AB1234567" validate={false} />
      </Field>
    </div>
  );
}
