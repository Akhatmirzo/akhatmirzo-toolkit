'use client';

import { Button, Checkbox, Drawer, Field, Input, Switch } from '@akhatmirzo/ui';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

const categories = ['Elektronika', 'Kiyim-kechak', "Uy-ro'zg'or", 'Kitoblar'];

export default function DrawerFilters() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(['Elektronika']);

  const toggle = (name: string, on: boolean) =>
    setSelected((prev) => (on ? [...prev, name] : prev.filter((x) => x !== name)));

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="outline" leftIcon={<SlidersHorizontal />}>
          Filtrlar
        </Button>
      </Drawer.Trigger>
      <Drawer.Content title="Filtrlar" description="Natijalarni toraytiring.">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Narxdan">
              <Input inputMode="numeric" placeholder="0" suffix="so'm" />
            </Field>
            <Field label="Narxgacha">
              <Input inputMode="numeric" placeholder="1 000 000" suffix="so'm" />
            </Field>
          </div>
          <div className="flex flex-col gap-3">
            {categories.map((c) => (
              <Checkbox
                key={c}
                label={c}
                checked={selected.includes(c)}
                onCheckedChange={(on) => toggle(c, on)}
              />
            ))}
          </div>
          <Switch label="Faqat mavjudlari" defaultChecked />
        </div>
        <Drawer.Footer>
          <Button onClick={() => setSelected([])}>Tozalash</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Qo'llash
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
