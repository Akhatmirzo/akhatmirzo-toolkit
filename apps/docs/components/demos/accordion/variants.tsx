'use client';

import { Accordion } from '@akhatmirzo/ui';

export default function AccordionVariants() {
  return (
    <div className="grid w-full gap-6 md:grid-cols-3">
      {(['separated', 'bordered', 'ghost'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">{variant}</span>
          <Accordion variant={variant} defaultValue="a">
            <Accordion.Item value="a" title="Yetkazib berish">
              Toshkent bo'ylab 1 kun.
            </Accordion.Item>
            <Accordion.Item value="b" title="To'lov">
              Click, Payme yoki naqd.
            </Accordion.Item>
            <Accordion.Item value="c" title="Qaytarish">
              14 kun ichida.
            </Accordion.Item>
          </Accordion>
        </div>
      ))}
    </div>
  );
}
