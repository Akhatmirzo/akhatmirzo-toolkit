import { Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Input', group: 'Formalar', order: 2 };

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export default function Page() {
  const [query, setQuery] = useState('Toshkent');
  const [cleared, setCleared] = useState(0);

  return (
    <DemoPage
      title="Input"
      description={
        <>
          Matn kiritish maydoni. Fokus halqasi konteynerda (<Code>focus-within</Code>), input'ning
          o'zida emas. Field ichida ham, tashqarisida ham ishlaydi.
        </>
      }
    >
      <DemoSection
        title="O'lchamlar"
        description="32 / 40 / 48 px — Button bilan bir qatorda tekis."
      >
        <DemoGrid min={200}>
          <Input size="sm" placeholder="sm — 32px" aria-label="sm" />
          <Input size="md" placeholder="md — 40px" aria-label="md" />
          <Input size="lg" placeholder="lg — 48px" aria-label="lg" />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Ikonkalar, prefix va suffix">
        <DemoGrid min={240}>
          <Input leftIcon={<SearchIcon />} placeholder="Qidirish" aria-label="Qidirish" />
          <Input rightIcon={<MailIcon />} placeholder="email@misol.uz" aria-label="Email" />
          <Input prefix="+998" placeholder="90 123 45 67" aria-label="Telefon" />
          <Input suffix="so'm" placeholder="0" inputMode="numeric" aria-label="Narx" />
          <Input prefix="https://" suffix=".uz" placeholder="sayt" aria-label="Sayt" />
          <Input
            size="lg"
            leftIcon={<SearchIcon />}
            suffix="so'm"
            placeholder="lg + ikonka"
            aria-label="lg"
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Clearable va parol"
        description={
          <>
            <Code>clearable</Code> — qiymat bo'lsa ✕; <Code>Esc</Code> ham tozalaydi.{' '}
            <Code>type="password"</Code> — ko'rsatish/yashirish tugmasi avtomatik.
          </>
        }
      >
        <DemoGrid min={240}>
          <Input
            leftIcon={<SearchIcon />}
            clearable
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setCleared((n) => n + 1)}
            aria-label="Qidirish"
          />
          <Input clearable defaultValue="Boshqarilmaydigan" aria-label="Uncontrolled" />
          <Input type="password" defaultValue="maxfiy123" aria-label="Parol" />
          <Input type="password" size="sm" placeholder="sm parol" aria-label="Parol sm" />
        </DemoGrid>
        <p className="text-xs text-text-muted">
          Qiymat: <Code>{query || '—'}</Code> · onClear: {cleared} marta
        </p>
      </DemoSection>

      <DemoSection title="Holatlar">
        <DemoGrid min={200}>
          <Input placeholder="Default" aria-label="Default" />
          <Input invalid defaultValue="sarvar@mail" aria-label="Invalid" />
          <Input disabled defaultValue="Disabled" aria-label="Disabled" />
          <Input readOnly defaultValue="Faqat o'qish" aria-label="ReadOnly" />
          <Input disabled prefix="+998" defaultValue="90 123 45 67" aria-label="Disabled prefix" />
          <Input readOnly clearable type="password" defaultValue="maxfiy" aria-label="RO parol" />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Field bilan">
        <DemoGrid min={240}>
          <Field label="Telefon" required description="SMS kod yuboriladi">
            <Input prefix="+998" placeholder="90 123 45 67" />
          </Field>
          <Field label="Email" error="Email manzil noto'g'ri">
            <Input leftIcon={<MailIcon />} defaultValue="sarvar@mail" clearable />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Klaviatura">
        <DemoRow>
          <p className="text-sm text-text-muted">
            <Code>Tab</Code> — input → parol tugmasi; <Code>Esc</Code> — clearable maydonni
            tozalaydi (bo'sh bo'lsa hodisa yuqoriga o'tadi, masalan Dialog yopiladi).
          </p>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
