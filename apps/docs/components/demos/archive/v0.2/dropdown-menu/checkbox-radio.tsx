'use client';

import { DropdownMenu } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function DropdownMenuCheckboxRadio() {
  const [columns, setColumns] = useState({ price: true, stock: true, sku: false });
  const [sort, setSort] = useState('new');

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DropdownMenu>
        <DropdownMenu.Trigger>Ustunlar</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Jadvalda ko'rsatish</DropdownMenu.Label>
          {(
            [
              ['price', 'Narx'],
              ['stock', 'Ombordagi soni'],
              ['sku', 'Artikul'],
            ] as const
          ).map(([key, label]) => (
            <DropdownMenu.CheckboxItem
              key={key}
              checked={columns[key]}
              onCheckedChange={(on) => setColumns((c) => ({ ...c, [key]: on }))}
              // Menyu yopilmasin — bir nechtasini ketma-ket belgilash uchun
              onSelect={(e) => e.preventDefault()}
            >
              {label}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenu.Trigger>Saralash</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Tartib</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenu.RadioItem value="new">Avval yangilari</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="cheap">Avval arzonlari</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="expensive">Avval qimmatlari</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="popular" disabled>
              Ommabop (tez orada)
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
      <span className="text-sm text-text-muted">Saralash: {sort}</span>
    </div>
  );
}
