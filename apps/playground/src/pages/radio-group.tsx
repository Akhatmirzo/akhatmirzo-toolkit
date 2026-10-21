import { Field, Radio, RadioGroup } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'RadioGroup', group: 'Tanlov', order: 2 };

export default function Page() {
  const [plan, setPlan] = useState('pro');

  return (
    <DemoPage
      title="RadioGroup"
      description="Native radio guruhi: Tab bilan guruhga kirish, ↑↓ / ←→ bilan yurish va tanlash, Space bilan tanlash."
    >
      <DemoSection title="Yo‘nalish">
        <DemoGrid min={260}>
          <DemoRow label="vertical (default)">
            <RadioGroup aria-label="To‘lov" defaultValue="click">
              <Radio value="click" label="Click" />
              <Radio value="payme" label="Payme" />
              <Radio value="cash" label="Naqd pul" />
            </RadioGroup>
          </DemoRow>
          <DemoRow label="horizontal">
            <RadioGroup aria-label="Yetkazish" orientation="horizontal" defaultValue="tez">
              <Radio value="tez" label="Tezkor" />
              <Radio value="oddiy" label="Oddiy" />
              <Radio value="olib" label="Olib ketish" />
            </RadioGroup>
          </DemoRow>
        </DemoGrid>
      </DemoSection>

      <DemoSection title="O‘lchamlar" description="sm — 16px, md — 20px (default)">
        <DemoGrid min={260}>
          <DemoRow label="sm">
            <RadioGroup aria-label="Kichik" size="sm" defaultValue="a">
              <Radio value="a" label="Birinchi" />
              <Radio value="b" label="Ikkinchi" description="Qo‘shimcha izoh" />
            </RadioGroup>
          </DemoRow>
          <DemoRow label="md">
            <RadioGroup aria-label="O‘rta" defaultValue="a">
              <Radio value="a" label="Birinchi" />
              <Radio value="b" label="Ikkinchi" description="Qo‘shimcha izoh" />
            </RadioGroup>
          </DemoRow>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Card varianti"
        description="Har bir variant katta bosiladigan karta — to‘lov usuli yoki tarif tanlash uchun."
      >
        <RadioGroup aria-label="Tarif" variant="card" value={plan} onValueChange={setPlan}>
          <Radio value="free" label="Bepul" description="1 ta loyiha, asosiy imkoniyatlar" />
          <Radio value="pro" label="Pro" description="Cheksiz loyihalar, ustuvor yordam" />
          <Radio value="team" label="Jamoa" description="Tez orada" disabled />
        </RadioGroup>
        <p className="text-sm text-text-muted">
          Tanlangan: <Code>{plan}</Code>
        </p>
        <RadioGroup
          aria-label="To‘lov usuli"
          variant="card"
          orientation="horizontal"
          defaultValue="click"
        >
          <Radio value="click" label="Click" description="Karta orqali" />
          <Radio value="payme" label="Payme" description="Ilova orqali" />
          <Radio value="cash" label="Naqd" description="Kuryerga" />
        </RadioGroup>
      </DemoSection>

      <DemoSection title="Disabled va invalid">
        <DemoGrid min={220}>
          <DemoRow label="Butun guruh disabled">
            <RadioGroup aria-label="Disabled" disabled defaultValue="a">
              <Radio value="a" label="Tanlangan" />
              <Radio value="b" label="Tanlanmagan" />
            </RadioGroup>
          </DemoRow>
          <DemoRow label="Bitta variant disabled">
            <RadioGroup aria-label="Qisman disabled">
              <Radio value="a" label="Mavjud" />
              <Radio value="b" label="Mavjud emas" disabled />
            </RadioGroup>
          </DemoRow>
          <DemoRow label="Xato (invalid)">
            <RadioGroup aria-label="Xato" invalid>
              <Radio value="a" label="Ha" />
              <Radio value="b" label="Yo‘q" />
            </RadioGroup>
          </DemoRow>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Field bilan"
        description={
          <>
            Izoh/xato guruhga <Code>aria-describedby</Code> orqali, <Code>invalid</Code>,{' '}
            <Code>required</Code>, <Code>disabled</Code> radio’larga o‘tadi.
          </>
        }
      >
        <Field label="Yetkazib berish" error="Usulni tanlang" required>
          <RadioGroup aria-label="Yetkazib berish">
            <Radio value="courier" label="Kuryer" />
            <Radio value="pickup" label="Olib ketish" />
          </RadioGroup>
        </Field>
      </DemoSection>
    </DemoPage>
  );
}
