'use client';

import { Accordion } from '@akhatmirzo/ui';

export default function AccordionNonCollapsible() {
  return (
    <Accordion collapsible={false} defaultValue="courier" variant="bordered" className="max-w-xl">
      <Accordion.Item value="courier" title="Kuryer orqali">
        Ertasi kuni eshigingizgacha. Narxi — 25 000 so'm.
      </Accordion.Item>
      <Accordion.Item value="pickup" title="Olib ketish punktidan">
        Toshkentdagi 12 ta punktdan bepul olib ketasiz.
      </Accordion.Item>
      <Accordion.Item value="post" title="Pochta orqali">
        Viloyatlarga 2–3 ish kuni. Narxi — 18 000 so'm.
      </Accordion.Item>
    </Accordion>
  );
}
