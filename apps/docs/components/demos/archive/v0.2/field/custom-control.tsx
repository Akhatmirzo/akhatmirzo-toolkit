'use client';

import { Field, useFieldControl } from '@akhatmirzo/ui';

function CitySelect() {
  const { controlProps, invalid, disabled } = useFieldControl();
  return (
    <select
      {...controlProps}
      disabled={disabled}
      data-invalid={invalid ? '' : undefined}
      className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text data-invalid:border-danger"
    >
      <option value="">Tanlang</option>
      <option>Toshkent</option>
      <option>Samarqand</option>
      <option>Buxoro</option>
    </select>
  );
}

export default function FieldCustomControl() {
  return (
    <div className="w-full max-w-sm">
      <Field label="Shahar" required error="Shaharni tanlang">
        <CitySelect />
      </Field>
    </div>
  );
}
