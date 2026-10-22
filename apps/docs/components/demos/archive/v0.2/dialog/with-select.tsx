'use client';

import { Button, Combobox, Dialog, Field, Select } from '@akhatmirzo/ui';
import { useState } from 'react';

const cities = ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', "Farg'ona", 'Namangan'].map(
  (label) => ({ value: label.toLowerCase().replace(/'/g, ''), label }),
);

export default function DialogWithSelect() {
  const [city, setCity] = useState<string | null>('toshkent');

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline">Yetkazib berish manzili</Button>
      </Dialog.Trigger>
      <Dialog.Content
        title="Yetkazib berish manzili"
        description="Ro'yxatlar oyna ustida ochiladi."
      >
        <div className="flex flex-col gap-4">
          <Field label="Shahar">
            <Combobox options={cities} value={city} onValueChange={setCity} clearable />
          </Field>
          <Field label="Yetkazish vaqti">
            <Select defaultValue="morning">
              <Select.Item value="morning">Ertalab (9:00–12:00)</Select.Item>
              <Select.Item value="day">Kunduzi (12:00–17:00)</Select.Item>
              <Select.Item value="evening">Kechqurun (17:00–21:00)</Select.Item>
            </Select>
          </Field>
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button>Bekor qilish</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button variant="primary">Saqlash</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
