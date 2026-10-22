import { Alert, Button, type AlertColor } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Alert', group: "Ko'rsatish", order: 6 };

const colors: { color: AlertColor; title: string }[] = [
  { color: 'info', title: 'Yangi versiya chiqdi' },
  { color: 'neutral', title: 'Qoralama saqlandi' },
  { color: 'primary', title: 'Maslahat: Ctrl + K bilan qidiring' },
  { color: 'success', title: 'Buyurtma qabul qilindi' },
  { color: 'warning', title: 'Obuna 3 kundan keyin tugaydi' },
  { color: 'danger', title: "To'lov o'tmadi" },
];

const variants = ['soft', 'outline', 'solid'] as const;

export default function Page() {
  const [open, setOpen] = useState(true);
  const [bannerOpen, setBannerOpen] = useState(true);

  return (
    <DemoPage
      title="Alert"
      description="Sahifa ichidagi doimiy xabar. danger/warning — role=alert, qolganlari — role=status. Radius lg, padding 12×16."
    >
      {variants.map((variant) => (
        <DemoSection key={variant} title={`variant="${variant}"`}>
          {colors.map(({ color, title }) => (
            <Alert key={color} variant={variant} color={color} title={title}>
              {color} rangi — ikonka va sarlavha birga ma'noni bildiradi.
            </Alert>
          ))}
        </DemoSection>
      ))}

      <DemoSection
        title="Harakat va yopish"
        description={
          <>
            <Code>action</Code> o'ngda (tor ekranda matn ostida), <Code>onClose</Code> — ✕
          </>
        }
      >
        {open ? (
          <Alert
            color="danger"
            title="To'lov o'tmadi"
            action={
              <Button size="sm" variant="outline">
                Qayta urinish
              </Button>
            }
            onClose={() => setOpen(false)}
          >
            Bank to'lovni rad etdi. Karta ma'lumotlarini tekshiring.
          </Alert>
        ) : (
          <Button size="sm" className="self-start" onClick={() => setOpen(true)}>
            Qaytarish
          </Button>
        )}
        <Alert icon={false} title="Ikonkasiz (icon={false})" />
      </DemoSection>

      <DemoSection title="Banner" description={<Code>banner</Code>} className="p-0">
        {bannerOpen ? (
          <Alert banner color="primary" onClose={() => setBannerOpen(false)}>
            Bugun 23:00 dan 01:00 gacha texnik ishlar olib boriladi.
          </Alert>
        ) : (
          <Button size="sm" className="m-6 self-start" onClick={() => setBannerOpen(true)}>
            Qaytarish
          </Button>
        )}
        <Alert banner variant="solid" color="warning">
          Sinov rejimi: to'lovlar haqiqiy emas.
        </Alert>
      </DemoSection>
    </DemoPage>
  );
}
