'use client';

import { Field, Select } from '@akhatmirzo/ui';

export default function SelectStates() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <Field label="O'chirilgan" disabled>
        <Select defaultValue="click">
          <Select.Item value="click">Click</Select.Item>
        </Select>
      </Field>
      <Field label="To'lov usuli" error="To'lov usulini tanlang" required>
        <Select>
          <Select.Item value="click">Click</Select.Item>
          <Select.Item value="payme">Payme</Select.Item>
        </Select>
      </Field>
      <Field label="O'chirilgan element">
        <Select placeholder="Usulni tanlang">
          <Select.Item value="click">Click</Select.Item>
          <Select.Item value="payme">Payme</Select.Item>
          <Select.Item value="uzum" disabled>
            Uzum (vaqtincha ishlamaydi)
          </Select.Item>
          <Select.Item value="cash">Naqd pul</Select.Item>
        </Select>
      </Field>
    </div>
  );
}
