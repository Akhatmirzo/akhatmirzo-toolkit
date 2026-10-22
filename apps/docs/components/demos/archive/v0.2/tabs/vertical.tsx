'use client';

import { Tabs } from '@akhatmirzo/ui';

export default function TabsVertical() {
  return (
    <Tabs defaultValue="profile" orientation="vertical" variant="pills" className="w-full">
      <Tabs.List aria-label="Sozlamalar" className="w-44">
        <Tabs.Trigger value="profile">Profil</Tabs.Trigger>
        <Tabs.Trigger value="security">Xavfsizlik</Tabs.Trigger>
        <Tabs.Trigger value="notifications" badge={3}>
          Bildirishnomalar
        </Tabs.Trigger>
        <Tabs.Trigger value="billing" disabled>
          To'lovlar
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="profile" className="text-text-muted">
        Ism, familiya va profil rasmi.
      </Tabs.Content>
      <Tabs.Content value="security" className="text-text-muted">
        Parol va ikki bosqichli tasdiqlash.
      </Tabs.Content>
      <Tabs.Content value="notifications" className="text-text-muted">
        SMS, email va Telegram orqali bildirishnomalar.
      </Tabs.Content>
    </Tabs>
  );
}
