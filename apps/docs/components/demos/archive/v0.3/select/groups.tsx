'use client';

import { Field, Select } from '@akhatmirzo/ui';

export default function SelectGroups() {
  return (
    <Field label="Filial" className="w-full max-w-xs">
      <Select defaultValue="fer">
        <Select.Item value="tsh">Toshkent</Select.Item>
        <Select.Item value="sam">Samarqand</Select.Item>
        <Select.Group label="Vodiy">
          <Select.Item value="and">Andijon</Select.Item>
          <Select.Item value="fer">Farg'ona</Select.Item>
          <Select.Item value="nam">Namangan</Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group label="Janub">
          <Select.Item value="qash">Qashqadaryo</Select.Item>
          <Select.Item value="sur">Surxondaryo</Select.Item>
        </Select.Group>
      </Select>
    </Field>
  );
}
