'use client';

import { Badge, Button, Field, Input, Switch } from '@akhatmirzo/ui';
import { useState, type CSSProperties } from 'react';

const BRANDS = ['indigo', 'emerald', 'sky', 'rose'] as const;

// Brend rangini faqat shu blok ichida almashtiramiz. color-mix — light va dark'da birdek ishlaydi.
const brandVars = (c: string) =>
  ({
    '--ak-primary': `var(--ak-${c}-600)`,
    '--ak-primary-hover': `var(--ak-${c}-700)`,
    '--ak-primary-soft': `color-mix(in srgb, var(--ak-${c}-500) 14%, var(--ak-surface))`,
    '--ak-primary-soft-hover': `color-mix(in srgb, var(--ak-${c}-500) 22%, var(--ak-surface))`,
    '--ak-primary-soft-foreground': `color-mix(in srgb, var(--ak-${c}-600) 65%, var(--ak-text))`,
    '--ak-ring': `color-mix(in srgb, var(--ak-${c}-500) 45%, transparent)`,
  }) as CSSProperties;

export default function ThemingBrand() {
  const [brand, setBrand] = useState<(typeof BRANDS)[number]>('emerald');

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {BRANDS.map((b) => (
          <Button
            key={b}
            size="sm"
            variant={b === brand ? 'outline' : 'ghost'}
            onClick={() => setBrand(b)}
          >
            {b}
          </Button>
        ))}
      </div>
      <div
        style={brandVars(brand)}
        className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5"
      >
        <Field label="Telefon">
          <Input placeholder="+998 90 123 45 67" />
        </Field>
        <Switch defaultChecked label="Yangiliklarga obuna" />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary">Saqlash</Button>
          <Button>Bekor qilish</Button>
          <Badge color="primary">Yangi</Badge>
        </div>
      </div>
    </div>
  );
}
