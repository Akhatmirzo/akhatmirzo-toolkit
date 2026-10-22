import {
  CardInput,
  Field,
  MaskedInput,
  MoneyInput,
  PhoneInput,
  getCardDetails,
  getPhoneDetails,
} from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'MaskedInput', group: 'Formalar', order: 7 };

function Raw({ value }: { value: string | number | null }) {
  return (
    <>
      Toza qiymat: <Code>{value === null || value === '' ? '—' : String(value)}</Code>
    </>
  );
}

function phoneError(value: string) {
  const { operator } = getPhoneDetails(value);
  if (value.length >= 2 && !operator) return `"${value.slice(0, 2)}" — bunday operator kodi yo'q`;
  return undefined;
}

function cardMessage(value: string) {
  const { complete, valid } = getCardDetails(value);
  if (!complete) return null;
  return valid ? "Karta raqami to'g'ri" : null;
}

export default function Page() {
  const [phone, setPhone] = useState('');
  const [sum, setSum] = useState<number | null>(1250000);
  const [card, setCard] = useState('');
  const [passport, setPassport] = useState('');
  const [price, setPrice] = useState<number | null>(null);

  const cardDetails = getCardDetails(card);
  const cardError =
    cardDetails.complete && !cardDetails.valid ? "Karta raqami noto'g'ri" : undefined;

  return (
    <DemoPage
      title="MaskedInput"
      description={
        <>
          Input ustidagi niqobli maydonlar: ichki qiymat — <b>toza</b>, ko'rinish — formatlangan.
          Formatlashda kursor sakramaydi (o'rtadan tahrirlang), <Code>Backspace</Code> doimiy
          belgini (<Code>-</Code>, bo'sh joy) emas, oldingi raqamni o'chiradi.
        </>
      }
    >
      <DemoSection
        title="Tayyor maydonlar"
        description="Prototipdagi to'rtta holat. Field bilan label, izoh va xato avtomatik ulanadi."
      >
        <DemoGrid min={260}>
          <Field
            label="Telefon · PhoneInput"
            description={phoneError(phone) ? undefined : <Raw value={phone} />}
            error={phoneError(phone)}
          >
            <PhoneInput value={phone} onValueChange={setPhone} />
          </Field>
          <Field label="Summa · MoneyInput" description={<Raw value={sum} />}>
            <MoneyInput value={sum} onValueChange={setSum} />
          </Field>
          <Field
            label="Karta raqami · CardInput"
            description={
              cardMessage(card) ??
              "Sinang: 8600… (Uzcard), 9860… (Humo), 4… (Visa). To'g'ri raqam: 4111 1111 1111 1111"
            }
            error={cardError}
          >
            <CardInput value={card} onValueChange={setCard} />
          </Field>
          <Field label="Pasport · MaskedInput" description={<Raw value={passport} />}>
            <MaskedInput
              mask="AA 9999999"
              uppercase
              placeholder="AB 1234567"
              value={passport}
              onValueChange={setPassport}
            />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="PhoneInput"
        description={
          <>
            <Code>+998</Code> — o'chirilmaydigan prefiks. "+998 90 123 45 67" ni nusxalab joylang —
            to'g'ri tushadi. Operator kodi tekshiriladi (33, 50, 55, 77, 88, 90, 91, 93, 94, 95, 97,
            98, 99).
          </>
        }
      >
        <DemoGrid min={240}>
          <PhoneInput aria-label="Telefon sm" size="sm" defaultValue="991234567" />
          <PhoneInput aria-label="Telefon md" defaultValue="330001122" />
          <PhoneInput aria-label="Telefon lg" size="lg" />
          <PhoneInput aria-label="Noto'g'ri" defaultValue="121234567" />
          <PhoneInput aria-label="Disabled" disabled defaultValue="901234567" />
          <PhoneInput aria-label="ReadOnly" readOnly defaultValue="935554433" />
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="MoneyInput"
        description={
          <>
            Minglik ajratuvchi — bo'sh joy. <Code>decimals</Code>, <Code>min</Code> (maydondan
            chiqqanda), <Code>max</Code> (undan katta yozib bo'lmaydi), <Code>currency</Code>.
          </>
        }
      >
        <DemoGrid min={240}>
          <Field label="Narx" description={<Raw value={price} />}>
            <MoneyInput value={price} onValueChange={setPrice} clearable />
          </Field>
          <Field label="Kurs (2 xona)" description="decimals={2}">
            <MoneyInput decimals={2} currency="$" defaultValue={12.5} />
          </Field>
          <Field label="Oylik to'lov" description="min 100 000 · max 50 000 000">
            <MoneyInput min={100000} max={50000000} />
          </Field>
          <Field label="Valyutasiz" description={'currency={null}'}>
            <MoneyInput currency={null} defaultValue={980000} />
          </Field>
          <Field label="Disabled" disabled>
            <MoneyInput defaultValue={450000} />
          </Field>
          <Field label="Xato" error="Hisobda mablag' yetarli emas">
            <MoneyInput defaultValue={3200000} />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="CardInput"
        description="4 tadan guruh, o'ngda brend belgisi; 16 raqam kiritilganda Luhn tekshiruvi."
      >
        <DemoGrid min={260}>
          <CardInput aria-label="Uzcard" defaultValue="8600123412341234" />
          <CardInput aria-label="Humo" defaultValue="9860010203040506" />
          <CardInput aria-label="Visa" defaultValue="4111111111111111" />
          <CardInput aria-label="Mastercard" defaultValue="5555555555554444" />
          <CardInput aria-label="Luhn xato" defaultValue="4111111111111112" />
          <CardInput aria-label="Disabled" disabled defaultValue="8600" />
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="MoneyInput showWords"
        description="Summa ostida so'z bilan (aria-live), Field description'dan keyin."
      >
        <DemoGrid min={260}>
          <Field label="Lotin" description="showWords">
            <MoneyInput value={sum} onValueChange={setSum} showWords />
          </Field>
          <Field
            label="Kirill, rasmiy"
            description="showWords={{ script: 'cyrillic', formal: true }}"
          >
            <MoneyInput
              value={sum}
              onValueChange={setSum}
              showWords={{ script: 'cyrillic', formal: true }}
            />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Umumiy niqob"
        description={
          <>
            <Code>9</Code> — raqam, <Code>A</Code> — harf, <Code>*</Code> — istalgan belgi; qolgani
            — doimiy belgi.
          </>
        }
      >
        <DemoGrid min={240}>
          <Field label="Avtomobil raqami" description='mask="99 A 999 AA"'>
            <MaskedInput mask="99 A 999 AA" uppercase placeholder="01 A 123 BC" />
          </Field>
          <Field label="JShShIR" description='mask="99999999999999"'>
            <MaskedInput mask="99999999999999" inputMode="numeric" placeholder="14 raqam" />
          </Field>
          <Field label="Vaqt" description='mask="99:99"'>
            <MaskedInput mask="99:99" inputMode="numeric" placeholder="09:30" />
          </Field>
          <Field label="Promo-kod" description='mask="****-****"'>
            <MaskedInput mask="****-****" uppercase placeholder="XXXX-XXXX" />
          </Field>
        </DemoGrid>
      </DemoSection>
    </DemoPage>
  );
}
