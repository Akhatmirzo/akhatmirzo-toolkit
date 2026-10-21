import { Badge, Tabs } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Tabs', group: 'Navigatsiya', order: 1 };

const variants = ['underline', 'pills', 'segmented'] as const;

const months = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

function Panel({ children }: { children: string }) {
  return <p className="text-sm text-text-muted">{children}</p>;
}

export default function Page() {
  const [period, setPeriod] = useState('week');

  return (
    <DemoPage
      title="Tabs"
      description="Bir sahifadagi bo‘limlar orasida almashish. Faol indikator 200ms ease-in-out bilan siljiydi; ← → (vertikalda ↑ ↓), Home / End — fokus bilan darhol faollashadi."
    >
      <DemoSection title="Variantlar" description="underline (default), pills, segmented">
        {variants.map((variant) => (
          <DemoRow key={variant} label={variant}>
            <Tabs defaultValue="info" variant={variant} className="w-full">
              <Tabs.List aria-label="Buyurtma">
                <Tabs.Trigger value="info">Ma’lumot</Tabs.Trigger>
                <Tabs.Trigger value="orders" badge={12}>
                  Buyurtmalar
                </Tabs.Trigger>
                <Tabs.Trigger value="reviews">Sharhlar</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="info">
                <Panel>Mijoz haqida asosiy ma’lumot: ism, telefon, manzil.</Panel>
              </Tabs.Content>
              <Tabs.Content value="orders">
                <Panel>Oxirgi 12 ta buyurtma ro‘yxati.</Panel>
              </Tabs.Content>
              <Tabs.Content value="reviews">
                <Panel>Mijoz qoldirgan sharhlar hali yo‘q.</Panel>
              </Tabs.Content>
            </Tabs>
          </DemoRow>
        ))}
      </DemoSection>

      <DemoSection
        title="O‘lchamlar"
        description="sm — 32px, md — 40px (segmented’da ichki tab 28 / 32px)"
      >
        {variants.map((variant) => (
          <DemoRow key={variant} label={`${variant} · sm`}>
            <Tabs defaultValue="all" variant={variant} size="sm">
              <Tabs.List aria-label="Holat bo‘yicha">
                <Tabs.Trigger value="all">Hammasi</Tabs.Trigger>
                <Tabs.Trigger value="active">Faol</Tabs.Trigger>
                <Tabs.Trigger value="archive">Arxiv</Tabs.Trigger>
              </Tabs.List>
            </Tabs>
          </DemoRow>
        ))}
      </DemoSection>

      <DemoSection
        title="Ko‘p tablar — gorizontal scroll"
        description="Sig‘magan tablar suriladi, chetlarida yumshoq fade. Klaviatura bilan yurganda faol tab ko‘rinishga keladi."
      >
        <div className="max-w-md">
          <Tabs defaultValue="Mart">
            <Tabs.List aria-label="Oylar">
              {months.map((m) => (
                <Tabs.Trigger key={m} value={m}>
                  {m}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            {months.map((m) => (
              <Tabs.Content key={m} value={m}>
                <Panel>{`${m} oyi bo‘yicha hisobot.`}</Panel>
              </Tabs.Content>
            ))}
          </Tabs>
        </div>
        <div className="max-w-xs">
          <Tabs defaultValue="Yanvar" variant="pills" size="sm">
            <Tabs.List aria-label="Oylar (pills)">
              {months.map((m) => (
                <Tabs.Trigger key={m} value={m}>
                  {m}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
        </div>
      </DemoSection>

      <DemoSection title="Vertikal" description={<Code>orientation=&quot;vertical&quot;</Code>}>
        {(['underline', 'pills', 'segmented'] as const).map((variant) => (
          <DemoRow key={variant} label={variant}>
            <Tabs
              defaultValue="profile"
              orientation="vertical"
              variant={variant}
              className="w-full"
            >
              <Tabs.List aria-label="Sozlamalar" className="w-44">
                <Tabs.Trigger value="profile">Profil</Tabs.Trigger>
                <Tabs.Trigger value="security">Xavfsizlik</Tabs.Trigger>
                <Tabs.Trigger value="notifications" badge={3}>
                  Bildirishnomalar
                </Tabs.Trigger>
                <Tabs.Trigger value="billing" disabled>
                  To‘lovlar
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="profile">
                <Panel>Ism, familiya va profil rasmi.</Panel>
              </Tabs.Content>
              <Tabs.Content value="security">
                <Panel>Parol va ikki bosqichli tasdiqlash.</Panel>
              </Tabs.Content>
              <Tabs.Content value="notifications">
                <Panel>SMS, email va push bildirishnomalar.</Panel>
              </Tabs.Content>
            </Tabs>
          </DemoRow>
        ))}
      </DemoSection>

      <DemoSection title="Holatlar" description="disabled tab, badge sifatida ReactNode">
        <Tabs defaultValue="new">
          <Tabs.List aria-label="Buyurtmalar holati">
            <Tabs.Trigger value="new" badge={4}>
              Yangi
            </Tabs.Trigger>
            <Tabs.Trigger
              value="paid"
              badge={
                <Badge color="success" size="sm">
                  +2
                </Badge>
              }
            >
              To‘langan
            </Tabs.Trigger>
            <Tabs.Trigger value="canceled" disabled>
              Bekor qilingan
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </DemoSection>

      <DemoSection
        title="Boshqariladigan"
        description={
          <>
            <Code>value</Code> + <Code>onValueChange</Code> — davr tanlash (segmented)
          </>
        }
      >
        <DemoRow>
          <Tabs value={period} onValueChange={setPeriod} variant="segmented">
            <Tabs.List aria-label="Davr">
              <Tabs.Trigger value="day">Kun</Tabs.Trigger>
              <Tabs.Trigger value="week">Hafta</Tabs.Trigger>
              <Tabs.Trigger value="month">Oy</Tabs.Trigger>
              <Tabs.Trigger value="year">Yil</Tabs.Trigger>
            </Tabs.List>
          </Tabs>
          <span className="text-sm text-text-muted">
            Tanlangan: <Code>{period}</Code>
          </span>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
