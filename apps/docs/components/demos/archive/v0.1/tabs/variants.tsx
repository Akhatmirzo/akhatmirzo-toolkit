'use client';

import { Tabs } from '@akhatmirzo/ui';

export default function TabsVariants() {
  return (
    <div className="flex w-full flex-col gap-8">
      {(['underline', 'pills', 'segmented'] as const).map((variant) => (
        <Tabs key={variant} defaultValue="info" variant={variant}>
          <Tabs.List aria-label={`Mijoz (${variant})`}>
            <Tabs.Trigger value="info">Ma'lumot</Tabs.Trigger>
            <Tabs.Trigger value="orders" badge={12}>
              Buyurtmalar
            </Tabs.Trigger>
            <Tabs.Trigger value="reviews">Sharhlar</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="info" className="text-text-muted">
            Ism, telefon va yetkazib berish manzili.
          </Tabs.Content>
          <Tabs.Content value="orders" className="text-text-muted">
            Oxirgi 12 ta buyurtma ro'yxati.
          </Tabs.Content>
          <Tabs.Content value="reviews" className="text-text-muted">
            Mijoz hali sharh qoldirmagan.
          </Tabs.Content>
        </Tabs>
      ))}
    </div>
  );
}
