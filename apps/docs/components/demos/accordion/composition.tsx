'use client';

import { Accordion, Badge } from '@akhatmirzo/ui';

export default function AccordionComposition() {
  return (
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
            <li>To'lov qabul qilindi</li>
          </ul>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="security">
        <Accordion.Trigger>Xavfsizlik</Accordion.Trigger>
        <Accordion.Content>Parolni oxirgi marta 3 oy oldin o'zgartirgansiz.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="billing" disabled>
        <Accordion.Trigger>To'lov ma'lumotlari (tez orada)</Accordion.Trigger>
        <Accordion.Content>—</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
