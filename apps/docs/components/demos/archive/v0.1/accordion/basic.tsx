'use client';

import { Accordion } from '@akhatmirzo/ui';

const faq = [
  {
    value: 'delivery',
    title: 'Yetkazib berish qancha vaqt oladi?',
    body: "Toshkent bo'ylab 1 kun, viloyatlarga 2–3 ish kuni.",
  },
  {
    value: 'payment',
    title: "Qanday to'lov usullari bor?",
    body: "Click, Payme, Uzum va naqd pul. Karta orqali to'lov darhol tasdiqlanadi.",
  },
  {
    value: 'return',
    title: "Mahsulotni qaytarsa bo'ladimi?",
    body: "Ha, 14 kun ichida, qadoq buzilmagan bo'lsa.",
  },
];

export default function AccordionBasic() {
  return (
    <Accordion defaultValue="delivery" className="max-w-xl">
      {faq.map((q) => (
        <Accordion.Item key={q.value} value={q.value} title={q.title}>
          {q.body}
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
