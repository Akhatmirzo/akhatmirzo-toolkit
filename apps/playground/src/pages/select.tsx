import type { UzRegionId } from '@akhatmirzo/core';
import { Button, Field, RegionSelect, Select } from '@akhatmirzo/ui';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Select', group: 'Formalar', order: 4 };

const regions = [
  ['tsh', 'Toshkent shahri'],
  ['tshv', 'Toshkent viloyati'],
  ['sam', 'Samarqand'],
  ['bux', 'Buxoro'],
  ['and', 'Andijon'],
  ['fer', "Farg'ona"],
  ['nam', 'Namangan'],
  ['qash', 'Qashqadaryo'],
  ['sur', 'Surxondaryo'],
  ['jiz', 'Jizzax'],
  ['sir', 'Sirdaryo'],
  ['nav', 'Navoiy'],
  ['xor', 'Xorazm'],
  ['qqr', "Qoraqalpog'iston"],
] as const;

function Dot({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className}>
      <circle cx="8" cy="8" r="4" fill="currentColor" />
    </svg>
  );
}

function Sizes() {
  return (
    <DemoGrid min={200}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Select key={size} size={size} aria-label={size} placeholder={`${size} — o'lcham`}>
          <Select.Item value="a">Birinchi</Select.Item>
          <Select.Item value="b">Ikkinchi</Select.Item>
        </Select>
      ))}
    </DemoGrid>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex max-w-md items-end gap-3">{children}</div>;
}

export default function Page() {
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('new');
  const [submitted, setSubmitted] = useState<string>('—');
  const [error, setError] = useState<string | undefined>();
  const [uzRegion, setUzRegion] = useState<UzRegionId | undefined>();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const delivery = String(data.get('delivery') ?? '');
    if (!delivery) {
      setError('Yetkazib berish usulini tanlang');
      return;
    }
    setError(undefined);
    setSubmitted(delivery);
  };

  return (
    <DemoPage
      title="Select"
      description={
        <>
          Qidiruvsiz tanlash ro'yxati. Trigger Input bilan bir xil ko'rinishda; panel kengligi =
          trigger kengligi; 8+ elementda balandlik 320px va ichida scroll. Qidiruv kerak bo'lsa —
          Combobox.
        </>
      }
    >
      <DemoSection title="Asosiy" description="Default placeholder — «Tanlang».">
        <DemoGrid min={240}>
          <Field label="Viloyat" description="Hammasi bo'lib 14 ta — ro'yxat scroll bo'ladi">
            <Select value={region} onValueChange={setRegion}>
              {regions.map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select>
          </Field>
          <Field label="Guruhlar bilan">
            <Select defaultValue="fer">
              <Select.Item value="tsh">Toshkent</Select.Item>
              <Select.Item value="sam">Samarqand</Select.Item>
              <Select.Group label="Vodiy">
                <Select.Item value="and">Andijon</Select.Item>
                <Select.Item value="fer">Farg'ona</Select.Item>
                <Select.Item value="nam">Namangan</Select.Item>
              </Select.Group>
              <Select.Separator />
              <Select.Group label="Janub">
                <Select.Item value="qash">Qashqadaryo</Select.Item>
                <Select.Item value="sur">Surxondaryo</Select.Item>
              </Select.Group>
            </Select>
          </Field>
        </DemoGrid>
        <p className="text-sm text-text-muted">
          Tanlangan viloyat: <Code>{region || '—'}</Code>
        </p>
      </DemoSection>

      <DemoSection title="O'lchamlar" description="32 / 40 / 48 px — Input va Button bilan teng.">
        <Sizes />
        <Row>
          <Select size="md" aria-label="Valyuta" defaultValue="uzs" className="w-32">
            <Select.Item value="uzs">UZS</Select.Item>
            <Select.Item value="usd">USD</Select.Item>
            <Select.Item value="eur">EUR</Select.Item>
          </Select>
          <Button variant="primary">To'lash</Button>
        </Row>
      </DemoSection>

      <DemoSection title="Holatlar">
        <DemoGrid min={220}>
          <Field label="Oddiy">
            <Select>
              <Select.Item value="1">Bir</Select.Item>
              <Select.Item value="2">Ikki</Select.Item>
            </Select>
          </Field>
          <Field label="Disabled" disabled>
            <Select defaultValue="1">
              <Select.Item value="1">Bir</Select.Item>
            </Select>
          </Field>
          <Field label="Xato" error="Viloyatni tanlang" required>
            <Select>
              <Select.Item value="1">Bir</Select.Item>
            </Select>
          </Field>
          <Field label="Disabled element">
            <Select>
              <Select.Item value="click">Click</Select.Item>
              <Select.Item value="payme">Payme</Select.Item>
              <Select.Item value="uzum" disabled>
                Uzum (vaqtincha ishlamaydi)
              </Select.Item>
              <Select.Item value="cash">Naqd pul</Select.Item>
            </Select>
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Ikonkali elementlar">
        <DemoGrid min={240}>
          <Field label="Buyurtma holati">
            <Select value={status} onValueChange={setStatus}>
              <Select.Item value="new" icon={<Dot className="text-info" />}>
                Yangi
              </Select.Item>
              <Select.Item value="progress" icon={<Dot className="text-warning" />}>
                Jarayonda
              </Select.Item>
              <Select.Item value="done" icon={<Dot className="text-success" />}>
                Yetkazildi
              </Select.Item>
              <Select.Item value="canceled" icon={<Dot className="text-danger" />}>
                Bekor qilindi
              </Select.Item>
            </Select>
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Forma bilan"
        description={
          <>
            <Code>name</Code> berilsa yashirin native select qiymatni <Code>FormData</Code> ga
            yuboradi.
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
          <Field label="Yetkazib berish" error={error} required>
            <Select name="delivery" onValueChange={() => setError(undefined)}>
              <Select.Item value="courier">Kuryer (1 kun)</Select.Item>
              <Select.Item value="pickup">Olib ketish</Select.Item>
              <Select.Item value="post">Pochta (2–3 kun)</Select.Item>
            </Select>
          </Field>
          <DemoRow>
            <Button type="submit" variant="primary">
              Yuborish
            </Button>
            <span className="text-sm text-text-muted">
              Yuborildi: <Code>{submitted}</Code>
            </span>
          </DemoRow>
        </form>
      </DemoSection>

      <DemoSection title="RegionSelect" description="UZ_REGIONS dan; qiymat — hudud id si.">
        <DemoGrid min={240}>
          <Field label="Hudud" description={<Code>{uzRegion ?? '—'}</Code>}>
            <RegionSelect value={uzRegion} onValueChange={setUzRegion} />
          </Field>
          <Field label="Kirill" description='script="cyrillic"'>
            <RegionSelect script="cyrillic" defaultValue="karakalpakstan" />
          </Field>
          <Field label="Viloyatlar" description="includeCity={false}">
            <RegionSelect includeCity={false} />
          </Field>
        </DemoGrid>
      </DemoSection>
    </DemoPage>
  );
}
