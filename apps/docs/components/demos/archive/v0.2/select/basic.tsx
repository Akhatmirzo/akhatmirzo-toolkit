'use client';

import { Field, Select } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function SelectBasic() {
  const [region, setRegion] = useState('');

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Field label="Viloyat" description="Buyurtma shu viloyatga yetkaziladi">
        <Select value={region} onValueChange={setRegion}>
          <Select.Item value="tsh">Toshkent shahri</Select.Item>
          <Select.Item value="sam">Samarqand</Select.Item>
          <Select.Item value="bux">Buxoro</Select.Item>
          <Select.Item value="and">Andijon</Select.Item>
          <Select.Item value="fer">Farg'ona</Select.Item>
          <Select.Item value="nam">Namangan</Select.Item>
          <Select.Item value="qash">Qashqadaryo</Select.Item>
          <Select.Item value="xor">Xorazm</Select.Item>
          <Select.Item value="qqr">Qoraqalpog'iston</Select.Item>
        </Select>
      </Field>
      <p className="text-sm text-text-muted">
        Qiymat: <span className="font-medium text-text">{region || '—'}</span>
      </p>
    </div>
  );
}
