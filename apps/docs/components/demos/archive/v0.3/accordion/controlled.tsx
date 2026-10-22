'use client';

import { Accordion, Button } from '@akhatmirzo/ui';
import { useState } from 'react';

const sections = [
  { value: 'profile', title: "Shaxsiy ma'lumotlar", body: "Ism, telefon va tug'ilgan sana." },
  { value: 'address', title: 'Manzillar', body: 'Uy: Toshkent, Chilonzor tumani, 9-mavze.' },
  { value: 'cards', title: "To'lov kartalari", body: 'Uzcard •• 4521, Humo •• 9087.' },
];

export default function AccordionControlled() {
  const [open, setOpen] = useState<string[]>(['profile']);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(sections.map((s) => s.value))}>
          Hammasini ochish
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen([])}>
          Hammasini yopish
        </Button>
      </div>
      <Accordion type="multiple" value={open} onValueChange={setOpen}>
        {sections.map((s) => (
          <Accordion.Item key={s.value} value={s.value} title={s.title}>
            {s.body}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}
