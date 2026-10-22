'use client';

import { Button, Select } from '@akhatmirzo/ui';

export default function SelectSizes() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Select
          key={size}
          size={size}
          aria-label={`O'lcham ${size}`}
          placeholder={`size="${size}"`}
        >
          <Select.Item value="a">Birinchi</Select.Item>
          <Select.Item value="b">Ikkinchi</Select.Item>
        </Select>
      ))}
      <div className="flex items-center gap-3">
        <Select aria-label="Valyuta" defaultValue="uzs" className="w-28">
          <Select.Item value="uzs">UZS</Select.Item>
          <Select.Item value="usd">USD</Select.Item>
          <Select.Item value="eur">EUR</Select.Item>
        </Select>
        <Button variant="primary">To'lash</Button>
      </div>
    </div>
  );
}
