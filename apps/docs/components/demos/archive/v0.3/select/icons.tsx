'use client';

import { Field, Select } from '@akhatmirzo/ui';

function Dot({ className }: { className: string }) {
  return <span className={`size-2 rounded-full ${className}`} />;
}

export default function SelectIcons() {
  return (
    <Field label="Buyurtma holati" className="w-full max-w-xs">
      <Select defaultValue="progress">
        <Select.Item value="new" icon={<Dot className="bg-info" />}>
          Yangi
        </Select.Item>
        <Select.Item value="progress" icon={<Dot className="bg-warning" />}>
          Jarayonda
        </Select.Item>
        <Select.Item value="done" icon={<Dot className="bg-success" />}>
          Yetkazildi
        </Select.Item>
        <Select.Item value="canceled" icon={<Dot className="bg-danger" />}>
          Bekor qilindi
        </Select.Item>
      </Select>
    </Field>
  );
}
