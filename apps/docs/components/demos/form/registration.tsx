'use client';

import { zUz } from '@akhatmirzo/core/zod';
import {
  Checkbox,
  DatePicker,
  Input,
  PhoneInput,
  PinflInput,
  Radio,
  RadioGroup,
  RegionSelect,
} from '@akhatmirzo/ui';
import { Form, FormField, FormRootError, FormSubmit } from '@akhatmirzo/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  fullName: z.string().trim().min(3, "To'liq ismingizni kiriting"),
  phone: zUz.phone(),
  pinfl: zUz.pinfl(),
  birthDate: z.date({ error: "Tug'ilgan sanani kiriting" }),
  gender: z.enum(['male', 'female'], { error: 'Jinsni tanlang' }),
  region: zUz.region(),
  password: zUz.password({ minScore: 2 }),
  terms: z.literal(true, { error: 'Shartlarga rozilik bering' }),
});

type Registration = z.output<typeof schema>;

export default function FormRegistration() {
  const [saved, setSaved] = useState<Registration | null>(null);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', phone: '', pinfl: '', region: '', password: '' },
  });

  const save = async (data: Registration) => {
    await new Promise((r) => setTimeout(r, 600));
    if (data.pinfl.startsWith('6')) {
      form.setError('root', {
        message: "Bu JShShIR bilan foydalanuvchi allaqachon ro'yxatdan o'tgan",
      });
      return;
    }
    setSaved(data);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Form form={form} onSubmit={save} className="flex flex-col gap-4">
        <FormField name="fullName" label="To'liq ism" required>
          <Input placeholder="Sarvar Abduxoliqov" autoComplete="name" />
        </FormField>
        <FormField name="phone" label="Telefon" description="SMS kod yuboriladi" required>
          <PhoneInput />
        </FormField>
        <FormField name="pinfl" label="JShShIR" description="Pasportdagi 14 xonali raqam" required>
          <PinflInput />
        </FormField>
        <FormField name="birthDate" label="Tug'ilgan sana" required>
          <DatePicker />
        </FormField>
        <FormField name="gender" label="Jinsi" required>
          <RadioGroup orientation="horizontal">
            <Radio value="male" label="Erkak" />
            <Radio value="female" label="Ayol" />
          </RadioGroup>
        </FormField>
        <FormField name="region" label="Hudud" required>
          <RegionSelect />
        </FormField>
        <FormField name="password" label="Parol" required>
          <Input type="password" autoComplete="new-password" />
        </FormField>
        <FormField name="terms">
          <Checkbox label="Foydalanish shartlariga roziman" />
        </FormField>
        <FormRootError />
        <FormSubmit fullWidth>Ro'yxatdan o'tish</FormSubmit>
      </Form>
      {saved && (
        <pre className="overflow-x-auto rounded-lg bg-surface-muted p-3 text-xs text-text-muted">
          {JSON.stringify(saved, null, 2)}
        </pre>
      )}
    </div>
  );
}
