'use client';

import { Combobox, Field, type ComboboxOption } from '@akhatmirzo/ui';

function Dot({ className }: { className: string }) {
  return <span className={`size-2.5 rounded-full ${className}`} />;
}

const statuses: ComboboxOption[] = [
  {
    value: 'new',
    label: 'Yangi',
    description: 'Buyurtma qabul qilindi',
    icon: <Dot className="bg-info" />,
  },
  {
    value: 'packing',
    label: "Yig'ilmoqda",
    description: 'Omborda tayyorlanmoqda',
    icon: <Dot className="bg-warning" />,
  },
  {
    value: 'shipping',
    label: "Yo'lda",
    description: 'Kuryerga topshirildi',
    icon: <Dot className="bg-primary" />,
  },
  {
    value: 'cancelled',
    label: 'Bekor qilingan',
    description: 'Arxivlangan holat',
    icon: <Dot className="bg-danger" />,
    disabled: true,
  },
];

export default function ComboboxDetails() {
  return (
    <Field label="Buyurtma holati" className="w-full max-w-xs">
      <Combobox options={statuses} defaultValue="packing" leftIcon={null} />
    </Field>
  );
}
