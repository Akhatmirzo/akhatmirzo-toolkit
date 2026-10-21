import { Accordion, Badge, Button } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Accordion', group: 'Navigatsiya', order: 2 };

const faq = [
  {
    value: 'delivery',
    title: 'Yetkazib berish qancha vaqt oladi?',
    body: 'Toshkent bo‘ylab 1 kun, viloyatlarga 2–3 ish kuni.',
  },
  {
    value: 'payment',
    title: 'Qanday to‘lov usullari bor?',
    body: 'Click, Payme, Uzum va naqd pul. Karta orqali to‘lov darhol tasdiqlanadi.',
  },
  {
    value: 'return',
    title: 'Mahsulotni qaytarsa bo‘ladimi?',
    body: 'Ha, 14 kun ichida, qadoq buzilmagan bo‘lsa.',
  },
];

const variants = ['separated', 'bordered', 'ghost'] as const;

export default function Page() {
  const [open, setOpen] = useState<string[]>(['delivery']);

  return (
    <DemoPage
      title="Accordion"
      description="Yig‘iladigan bo‘limlar (FAQ, sozlamalar). Sarlavha 48px, ochilish balandlik animatsiyasi 200ms ease-in-out, chevron 180° buriladi. ↑ ↓, Home / End — sarlavhalar bo‘ylab; Enter / Space — ochish."
    >
      <DemoSection title="Variantlar" description="separated (default), bordered, ghost">
        <DemoGrid min={280}>
          {variants.map((variant) => (
            <DemoRow key={variant} label={variant} className="block">
              <Accordion variant={variant} defaultValue="delivery">
                {faq.map((q) => (
                  <Accordion.Item key={q.value} value={q.value} title={q.title}>
                    {q.body}
                  </Accordion.Item>
                ))}
              </Accordion>
            </DemoRow>
          ))}
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Bir nechtasi ochiq" description={<Code>type=&quot;multiple&quot;</Code>}>
        <Accordion type="multiple" defaultValue={['delivery', 'payment']} className="max-w-xl">
          {faq.map((q) => (
            <Accordion.Item key={q.value} value={q.value} title={q.title}>
              {q.body}
            </Accordion.Item>
          ))}
        </Accordion>
      </DemoSection>

      <DemoSection
        title="Yopib bo‘lmaydigan"
        description={
          <>
            <Code>collapsible={'{false}'}</Code> — doim bittasi ochiq turadi
          </>
        }
      >
        <Accordion
          collapsible={false}
          defaultValue="payment"
          variant="bordered"
          className="max-w-xl"
        >
          {faq.map((q) => (
            <Accordion.Item key={q.value} value={q.value} title={q.title}>
              {q.body}
            </Accordion.Item>
          ))}
        </Accordion>
      </DemoSection>

      <DemoSection
        title="Kompozitsiya"
        description="Item / Trigger / Content — sarlavhaga o‘z kontentingizni joylash uchun; disabled bo‘lim"
      >
        <Accordion variant="bordered" className="max-w-xl">
          <Accordion.Item value="notifications">
            <Accordion.Trigger>
              <span className="flex items-center gap-2">
                Bildirishnomalar
                <Badge color="primary" size="sm">
                  3 ta yangi
                </Badge>
              </span>
            </Accordion.Trigger>
            <Accordion.Content>
              <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
                <li>Buyurtma #1042 yetkazildi</li>
                <li>Yangi sharh qoldirildi</li>
                <li>To‘lov qabul qilindi</li>
              </ul>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="security">
            <Accordion.Trigger>Xavfsizlik</Accordion.Trigger>
            <Accordion.Content>Parolni oxirgi marta 3 oy oldin o‘zgartirgansiz.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="billing" disabled>
            <Accordion.Trigger>To‘lov ma’lumotlari (tez kunda)</Accordion.Trigger>
            <Accordion.Content>—</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </DemoSection>

      <DemoSection
        title="Boshqariladigan"
        description={
          <>
            <Code>value</Code> + <Code>onValueChange</Code>
          </>
        }
      >
        <DemoRow>
          <Button size="sm" variant="outline" onClick={() => setOpen(faq.map((q) => q.value))}>
            Hammasini ochish
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpen([])}>
            Hammasini yopish
          </Button>
          <span className="text-sm text-text-muted">
            Ochiq: <Code>{open.length ? open.join(', ') : '—'}</Code>
          </span>
        </DemoRow>
        <Accordion type="multiple" value={open} onValueChange={setOpen} className="max-w-xl">
          {faq.map((q) => (
            <Accordion.Item key={q.value} value={q.value} title={q.title}>
              {q.body}
            </Accordion.Item>
          ))}
        </Accordion>
      </DemoSection>
    </DemoPage>
  );
}
