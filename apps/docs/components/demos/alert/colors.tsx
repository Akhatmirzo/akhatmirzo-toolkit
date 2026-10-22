'use client';

import { Alert } from '@akhatmirzo/ui';

export default function AlertColors() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert title="Yangi versiya chiqdi">
        Sahifani yangilang — o'zgarishlar darhol kuchga kiradi.
      </Alert>
      <Alert color="success" title="Buyurtma qabul qilindi">
        Kuryer bugun 18:00 gacha qo'ng'iroq qiladi.
      </Alert>
      <Alert color="warning" title="Obuna 3 kundan keyin tugaydi">
        To'lovni hozir qilsangiz, ma'lumotlaringiz saqlanib qoladi.
      </Alert>
      <Alert color="danger" title="To'lov o'tmadi">
        Kartada mablag' yetarli emas. Boshqa kartani sinab ko'ring.
      </Alert>
      <Alert color="primary" title="Maslahat">
        Tez qidirish uchun Ctrl + K ni bosing.
      </Alert>
      <Alert color="neutral" title="Qoralama saqlandi" />
    </div>
  );
}
