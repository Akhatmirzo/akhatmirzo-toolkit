'use client';

import { Field, MaskedInput } from '@akhatmirzo/ui';

export default function MaskedInputCustom() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="Avtomobil raqami" description='mask="99 A 999 AA"'>
        <MaskedInput mask="99 A 999 AA" uppercase placeholder="01 A 123 BC" />
      </Field>
      <Field label="JShShIR" description="14 ta raqam">
        <MaskedInput mask="99999999999999" inputMode="numeric" placeholder="14 raqam" />
      </Field>
      <Field label="Vaqt" description='mask="99:99"'>
        <MaskedInput mask="99:99" inputMode="numeric" placeholder="09:30" />
      </Field>
      <Field label="Promo-kod" description='mask="****-****"'>
        <MaskedInput mask="****-****" uppercase placeholder="XXXX-XXXX" />
      </Field>
    </div>
  );
}
