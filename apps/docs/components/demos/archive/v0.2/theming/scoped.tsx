'use client';

import { Badge, Button, Field, Input } from '@akhatmirzo/ui';

// data-theme istalgan elementga qo'yiladi — tokenlar faqat shu blok ichida almashadi
export default function ThemingScoped() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {(['light', 'dark'] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          className="flex flex-col gap-4 rounded-xl border border-border bg-background p-5 text-text"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">data-theme="{theme}"</span>
            <Badge color="success" dot>
              Faol
            </Badge>
          </div>
          <Field label="Ism">
            <Input placeholder="Sarvar" />
          </Field>
          <div className="flex gap-2">
            <Button variant="primary">Saqlash</Button>
            <Button variant="outline">Bekor qilish</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
