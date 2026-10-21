import {
  UZ_OPERATOR_CODES,
  createStorage,
  detectCardBrand,
  isValidCardNumber,
  isValidEmail,
  parsePhone,
  passwordStrength,
  type CardBrand,
  type PasswordScore,
} from '@akhatmirzo/core';
import { Badge, Button, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Validatsiya', group: 'Funksiyalar', order: 3 };

const store = createStorage({ prefix: 'playground:validate:' });

const BRAND_LABEL: Record<CardBrand, string> = {
  uzcard: 'Uzcard',
  humo: 'Humo',
  visa: 'Visa',
  mastercard: 'Mastercard',
};

const SCORE_BAR: Record<PasswordScore, string> = {
  0: 'bg-danger',
  1: 'bg-danger',
  2: 'bg-warning',
  3: 'bg-success',
  4: 'bg-success',
};

const SCORE_BADGE = {
  0: 'danger',
  1: 'danger',
  2: 'warning',
  3: 'success',
  4: 'success',
} as const satisfies Record<PasswordScore, string>;

const CHECK_LABELS = {
  length: 'Kamida 8 belgi',
  lower: 'Kichik harf',
  upper: 'Katta harf',
  digit: 'Raqam',
  symbol: 'Belgi (!@#…)',
} as const;

function PhoneDemo() {
  const [value, setValue] = useState('90 123 45 67');
  const parsed = parsePhone(value);
  const code = parsed.digits.slice(0, 2);
  const error =
    code.length === 2 && !parsed.operator
      ? `"${code}" — bunday operator kodi yo'q`
      : parsed.digits.length > 9
        ? "Raqam juda uzun (9 ta raqam bo'lishi kerak)"
        : undefined;

  return (
    <DemoSection
      title="Telefon"
      description={
        <>
          <Code>parsePhone</Code> — «+998 90 123-45-67», «998901234567», «901234567» bir xil
          tushuniladi.
        </>
      }
    >
      <DemoGrid min={260}>
        <Field label="Telefon raqami" error={error} description="Masalan: 90 123 45 67">
          <Input
            prefix="+998"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="tel"
            clearable
            onClear={() => setValue('')}
          />
        </Field>
        <div className="flex flex-col gap-2 text-sm">
          <DemoRow label="Natija">
            <Badge color={parsed.valid ? 'success' : 'neutral'} dot>
              {parsed.valid ? "To'g'ri" : "To'liq emas"}
            </Badge>
            {parsed.operator && <Badge color="info">Operator: {parsed.operator}</Badge>}
          </DemoRow>
          <p className="text-text-muted">
            Toza qiymat: <Code>{parsed.digits || '—'}</Code>
          </p>
        </div>
      </DemoGrid>
      <DemoRow label="Operator kodlari (UZ_OPERATOR_CODES)">
        {UZ_OPERATOR_CODES.map((c) => (
          <Badge key={c} variant="outline" size="sm">
            {c}
          </Badge>
        ))}
      </DemoRow>
    </DemoSection>
  );
}

function EmailDemo() {
  const [email, setEmail] = useState('sarvar@mail');
  const valid = isValidEmail(email);
  return (
    <DemoSection title="Email" description={<Code>isValidEmail</Code>}>
      <DemoGrid min={260}>
        <Field
          label="Email"
          error={email.trim() && !valid ? "Email manzil noto'g'ri" : undefined}
          description="Amaliy tekshiruv: nom@domen.zona"
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            clearable
            onClear={() => setEmail('')}
          />
        </Field>
        <DemoRow label="Natija">
          <Badge color={valid ? 'success' : 'danger'} dot>
            {valid ? "To'g'ri" : "Noto'g'ri"}
          </Badge>
        </DemoRow>
      </DemoGrid>
    </DemoSection>
  );
}

function CardDemo() {
  const [value, setValue] = useState('4111 1111 1111 1111');
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const brand = detectCardBrand(digits);
  const complete = digits.length === 16;
  const valid = isValidCardNumber(digits);

  return (
    <DemoSection
      title="Karta raqami"
      description={
        <>
          <Code>detectCardBrand</Code> + <Code>isValidCardNumber</Code> (16 raqam va Luhn). Sinab
          ko'ring: 8600… (Uzcard), 9860… (Humo), 4… (Visa), 51–55 / 2221–2720 (Mastercard).
        </>
      }
    >
      <DemoGrid min={260}>
        <Field
          label="Karta raqami"
          error={complete && !valid ? "Karta raqami noto'g'ri" : undefined}
          description="To'g'ri namuna: 4111 1111 1111 1111"
        >
          <Input
            value={digits.replace(/(\d{4})(?=\d)/g, '$1 ')}
            onChange={(e) => setValue(e.target.value)}
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            suffix={brand ? BRAND_LABEL[brand] : undefined}
          />
        </Field>
        <DemoRow label="Natija">
          <Badge color={brand ? 'info' : 'neutral'}>
            {brand ? BRAND_LABEL[brand] : "Brend noma'lum"}
          </Badge>
          <Badge color={!complete ? 'neutral' : valid ? 'success' : 'danger'} dot>
            {!complete ? `${digits.length}/16` : valid ? 'Luhn: to‘g‘ri' : 'Luhn: xato'}
          </Badge>
        </DemoRow>
      </DemoGrid>
    </DemoSection>
  );
}

function PasswordDemo() {
  const [pw, setPw] = useState('Parol123');
  const s = passwordStrength(pw);
  return (
    <DemoSection
      title="Parol kuchliligi"
      description={
        <>
          <Code>passwordStrength</Code> → ball 0..4, yorliq va shartlar.
        </>
      }
    >
      <DemoGrid min={260}>
        <Field label="Parol">
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <div className="flex flex-col gap-3">
          <div
            className="flex gap-1"
            role="meter"
            aria-label="Parol kuchliligi"
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={s.score}
            aria-valuetext={s.label}
          >
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  pw && i <= Math.max(s.score, 1) ? SCORE_BAR[s.score] : 'bg-surface-muted'
                }`}
              />
            ))}
          </div>
          <DemoRow>
            <Badge color={SCORE_BADGE[s.score]}>{s.label}</Badge>
            <span className="text-xs text-text-muted">ball: {s.score}/4</span>
          </DemoRow>
          <ul className="flex flex-col gap-1 text-sm">
            {(Object.keys(CHECK_LABELS) as (keyof typeof CHECK_LABELS)[]).map((k) => (
              <li key={k} className={s.checks[k] ? 'text-text' : 'text-text-muted'}>
                {s.checks[k] ? '✓' : '○'} {CHECK_LABELS[k]}
              </li>
            ))}
          </ul>
        </div>
      </DemoGrid>
    </DemoSection>
  );
}

function StorageDemo() {
  const [key, setKey] = useState('ism');
  const [value, setValue] = useState('Sarvar');
  const [ttl, setTtl] = useState('10');
  const [result, setResult] = useState<string>('—');

  const save = () => {
    const sec = Number(ttl);
    const ok = store.set(key, value, { ttl: sec > 0 ? sec * 1000 : undefined });
    setResult(
      ok
        ? `Saqlandi${sec > 0 ? ` (${sec} soniya)` : ' (muddatsiz)'}`
        : "Saqlab bo'lmadi (storage mavjud emas)",
    );
  };
  const read = () => {
    const v = store.get<string>(key);
    setResult(v === null ? "null — yo'q yoki muddati o'tgan" : JSON.stringify(v));
  };

  return (
    <DemoSection
      title="Storage"
      description={
        <>
          <Code>createStorage({'{ prefix }'})</Code> — JSON, <Code>ttl</Code> bilan muddat; SSR va
          taqiqlangan storage'da jim ishlaydi. Kalit: <Code>playground:validate:{key}</Code>
        </>
      }
    >
      <DemoGrid min={200}>
        <Field label="Kalit">
          <Input value={key} onChange={(e) => setKey(e.target.value)} />
        </Field>
        <Field label="Qiymat">
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label="Muddat" description="0 — muddatsiz">
          <Input
            type="number"
            min={0}
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
            suffix="soniya"
          />
        </Field>
      </DemoGrid>
      <DemoRow>
        <Button variant="primary" onClick={save}>
          Saqlash
        </Button>
        <Button variant="outline" onClick={read}>
          O'qish
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            store.remove(key);
            setResult("O'chirildi");
          }}
        >
          O'chirish
        </Button>
      </DemoRow>
      <p className="text-sm text-text-muted">
        Natija: <Code>{result}</Code>
      </p>
    </DemoSection>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="Validatsiya"
      description={
        <>
          <Code>@akhatmirzo/core</Code> dagi tekshiruv funksiyalari: telefon, email, karta, parol va{' '}
          <Code>createStorage</Code>. Hammasi sof va SSR-xavfsiz.
        </>
      }
    >
      <PhoneDemo />
      <EmailDemo />
      <CardDemo />
      <PasswordDemo />
      <StorageDemo />
    </DemoPage>
  );
}
