'use client';

import { Field, Rating } from '@akhatmirzo/ui';

export default function RatingWithField() {
  return (
    <Field label="Xizmat sifati" description="1 dan 5 gacha baholang">
      <Rating defaultValue={5} allowClear={false} />
    </Field>
  );
}
