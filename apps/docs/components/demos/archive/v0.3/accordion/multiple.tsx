'use client';

import { Accordion } from '@akhatmirzo/ui';

export default function AccordionMultiple() {
  return (
    <Accordion type="multiple" defaultValue={['delivery', 'payment']} className="max-w-xl">
      <Accordion.Item value="delivery" title="Yetkazib berish qancha vaqt oladi?">
        Toshkent bo'ylab 1 kun, viloyatlarga 2–3 ish kuni.
      </Accordion.Item>
      <Accordion.Item value="payment" title="Qanday to'lov usullari bor?">
        Click, Payme, Uzum va naqd pul.
      </Accordion.Item>
      <Accordion.Item value="return" title="Mahsulotni qaytarsa bo'ladimi?">
        Ha, 14 kun ichida, qadoq buzilmagan bo'lsa.
      </Accordion.Item>
    </Accordion>
  );
}
