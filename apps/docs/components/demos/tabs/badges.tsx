'use client';

import { Badge, Tabs } from '@akhatmirzo/ui';

export default function TabsBadges() {
  return (
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
          To'langan
        </Tabs.Trigger>
        <Tabs.Trigger value="canceled" disabled>
          Bekor qilingan
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs>
  );
}
