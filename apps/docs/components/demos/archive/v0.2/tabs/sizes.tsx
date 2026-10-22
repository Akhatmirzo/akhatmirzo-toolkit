'use client';

import { Tabs } from '@akhatmirzo/ui';

export default function TabsSizes() {
  return (
    <div className="flex flex-col items-start gap-4">
      {(['underline', 'pills', 'segmented'] as const).map((variant) => (
        <Tabs key={variant} defaultValue="all" variant={variant} size="sm">
          <Tabs.List aria-label="Holat bo'yicha">
            <Tabs.Trigger value="all">Hammasi</Tabs.Trigger>
            <Tabs.Trigger value="active">Faol</Tabs.Trigger>
            <Tabs.Trigger value="archive">Arxiv</Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      ))}
    </div>
  );
}
