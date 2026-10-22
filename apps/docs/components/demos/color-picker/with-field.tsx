'use client';

import { ColorPicker, Field } from '@akhatmirzo/ui';

export default function ColorPickerWithField() {
  return (
    <div className="w-full max-w-60">
      <Field label="Brend rangi" description="Tugmalar va havolalarda ishlatiladi">
        <ColorPicker name="brand" defaultValue="#0ea5e9" />
      </Field>
    </div>
  );
}
