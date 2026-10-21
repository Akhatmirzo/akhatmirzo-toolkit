import { Field, Input, Textarea, useFieldControl } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Field', group: 'Formalar', order: 1 };

function NativeSelect() {
  const { controlProps, invalid } = useFieldControl();
  return (
    <select
      {...controlProps}
      data-invalid={invalid ? '' : undefined}
      className="focus-ring h-10 rounded-lg border border-border bg-surface px-3 font-sans text-sm text-text data-invalid:border-danger"
    >
      <option value="">Tanlang</option>
      <option>Toshkent</option>
      <option>Samarqand</option>
    </select>
  );
}

export default function Page() {
  const [email, setEmail] = useState('sarvar@mail');
  const emailError = /^\S+@\S+\.\S+$/.test(email) ? undefined : "Email manzil noto'g'ri";

  return (
    <DemoPage
      title="Field"
      description={
        <>
          Label, izoh va xato matnini o'raydi; <Code>id</Code>, <Code>htmlFor</Code>,{' '}
          <Code>aria-describedby</Code>, <Code>aria-invalid</Code>, <Code>aria-required</Code> ni
          bolaga avtomatik ulaydi.
        </>
      }
    >
      <DemoSection title="Asosiy">
        <DemoGrid min={240}>
          <Field label="Telefon" required description="SMS kod yuboriladi">
            <Input prefix="+998" placeholder="90 123 45 67" />
          </Field>
          <Field label="Parol" description="Kamida 8 belgi">
            <Input type="password" defaultValue="maxfiy123" />
          </Field>
          <Field label="Email" error={emailError}>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} clearable />
          </Field>
          <Field label="Hudud" description="Disabled" disabled>
            <Input defaultValue="Toshkent" />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Orientation" description={<Code>orientation="horizontal"</Code>}>
        <Field orientation="horizontal" label="To'liq ism" description="Pasportdagidek">
          <Input placeholder="Sarvar Abduxoliqov" />
        </Field>
        <Field orientation="horizontal" label="Izoh" error="Izoh juda qisqa">
          <Textarea defaultValue="Yaxshi" showCount maxLength={200} />
        </Field>
      </DemoSection>

      <DemoSection
        title="useFieldControl"
        description="O'zingizning boshqaruv elementingizni Field bilan bog'lash uchun hook."
      >
        <DemoGrid min={240}>
          <Field label="Shahar" required>
            <NativeSelect />
          </Field>
          <Field label="Shahar" error="Shaharni tanlang">
            <NativeSelect />
          </Field>
        </DemoGrid>
      </DemoSection>
    </DemoPage>
  );
}
