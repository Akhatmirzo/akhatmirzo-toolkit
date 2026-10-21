import { Button, Switch, Tabs, toast, type ToastPosition } from '@akhatmirzo/ui';
import { useRef } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';
import { setToasterSettings, useToasterSettings } from '../toaster-settings';

export const meta: PageMeta = { title: 'Toast', group: 'Overlay', order: 5 };

const positions: { value: ToastPosition; label: string }[] = [
  { value: 'top-left', label: 'Yuqori chap' },
  { value: 'top-center', label: 'Yuqori markaz' },
  { value: 'top-right', label: 'Yuqori o‘ng' },
  { value: 'bottom-left', label: 'Pastki chap' },
  { value: 'bottom-center', label: 'Pastki markaz' },
  { value: 'bottom-right', label: 'Pastki o‘ng' },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Page() {
  // Toaster ilova ildizida (App.tsx) — sahifa faqat uning sozlamalarini o'zgartiradi
  const { position, closeButton } = useToasterSettings();
  const setPosition = (value: ToastPosition) => setToasterSettings({ position: value });
  const setCloseButton = (value: boolean) => setToasterSettings({ closeButton: value });
  const counter = useRef(0);

  const saveOrder = async () => {
    await wait(1500);
    return 1042;
  };
  const failingRequest = async () => {
    await wait(1200);
    throw new Error('Server javob bermadi');
  };

  return (
    <>
      <DemoPage
        title="Toast"
        description="Qisqa bildirishnomalar: imperativ toast() API, ko‘pi bilan 3 tasi dasta bo‘lib turadi, hover’da yoyiladi va taymer to‘xtaydi. O‘ngga surib yopiladi; F8 — toast hududiga fokus."
      >
        <DemoSection title="Turlar" description="default, success, error, warning, info, loading">
          <DemoRow>
            <Button variant="outline" onClick={() => toast('Havola nusxalandi')}>
              Oddiy
            </Button>
            <Button variant="outline" onClick={() => toast.success('O‘zgarishlar saqlandi')}>
              Success
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.error('Ulanib bo‘lmadi', {
                  description: 'Internetni tekshirib, qayta urinib ko‘ring.',
                })
              }
            >
              Error
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.warning('Obuna 3 kundan keyin tugaydi', {
                  description: 'Uzluksiz ishlash uchun to‘lovni oldindan qiling.',
                })
              }
            >
              Warning
            </Button>
            <Button variant="outline" onClick={() => toast.info('Yangi versiya mavjud')}>
              Info
            </Button>
            <Button variant="outline" onClick={() => toast.loading('Hisobot tayyorlanmoqda...')}>
              Loading
            </Button>
          </DemoRow>
        </DemoSection>

        <DemoSection title="Description va amal" description="action: { label, onClick }">
          <DemoRow>
            <Button
              variant="outline"
              onClick={() =>
                toast.success('Buyurtma yaratildi', {
                  description: '#1042 · 1 250 000 so‘m',
                  action: { label: 'Ko‘rish', onClick: () => toast.info('Buyurtma #1042 ochildi') },
                })
              }
            >
              Success + amal
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast('Mahsulot o‘chirildi', {
                  description: 'iPhone 15 Pro, 256 GB',
                  action: {
                    label: 'Bekor qilish',
                    onClick: () => toast.success('Mahsulot qaytarildi'),
                  },
                })
              }
            >
              Undo bilan
            </Button>
          </DemoRow>
        </DemoSection>

        <DemoSection
          title="Promise va yangilash"
          description={
            <>
              <Code>toast.promise()</Code> va <Code>{'toast.success(..., { id })'}</Code> — bitta
              toast loading’dan natijaga o‘tadi
            </>
          }
        >
          <DemoRow>
            <Button
              variant="outline"
              onClick={() =>
                toast.promise(saveOrder, {
                  loading: 'Saqlanmoqda...',
                  success: (id) => `Buyurtma #${id} saqlandi`,
                  error: 'Xatolik yuz berdi',
                })
              }
            >
              Promise (muvaffaqiyatli)
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast
                  .promise(failingRequest, {
                    loading: 'Yuborilmoqda...',
                    success: 'Yuborildi',
                    error: (e) => `Xatolik: ${(e as Error).message}`,
                  })
                  .catch(() => {})
              }
            >
              Promise (xato)
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const id = toast.loading('Fayl yuklanmoqda...', { description: 'hisobot.xlsx' });
                await wait(1000);
                toast.loading('Fayl tekshirilmoqda...', { id, description: 'hisobot.xlsx' });
                await wait(1000);
                toast.success('Fayl yuklandi', { id, description: 'hisobot.xlsx · 2,4 MB' });
              }}
            >
              {'{ id } bilan yangilash'}
            </Button>
          </DemoRow>
        </DemoSection>

        <DemoSection
          title="Dasta (stack)"
          description="Ketma-ket bossangiz dasta bo‘ladi; 3 tadan ortig‘i yashiriladi va navbat kutadi. Ustiga olib borsangiz yoyiladi."
        >
          <DemoRow>
            <Button
              variant="outline"
              onClick={() => {
                counter.current += 1;
                toast(`Xabar #${counter.current}`, { description: 'Yangi bildirishnoma' });
              }}
            >
              Bittadan qo‘shish
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toast.info('Yangi foydalanuvchi ro‘yxatdan o‘tdi');
                toast.success('To‘lov qabul qilindi', { description: '350 000 so‘m' });
                toast.warning('Omborda 3 ta qoldi');
                toast('Sharh qoldirildi');
              }}
            >
              4 tasini birdan
            </Button>
            <Button variant="ghost" onClick={() => toast.dismiss()}>
              Hammasini yopish
            </Button>
          </DemoRow>
        </DemoSection>

        <DemoSection
          title="Toaster sozlamalari"
          description={
            <>
              <Code>{'<Toaster position closeButton />'}</Code> — telefonda doim pastda, to‘liq
              kenglikda
            </>
          }
        >
          <Tabs
            value={position}
            onValueChange={(v) => setPosition(v as ToastPosition)}
            variant="segmented"
            size="sm"
          >
            <Tabs.List aria-label="Joylashuv">
              {positions.map((p) => (
                <Tabs.Trigger key={p.value} value={p.value}>
                  {p.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
          <DemoRow>
            <Switch label="✕ tugmasi" checked={closeButton} onCheckedChange={setCloseButton} />
            <Button
              variant="outline"
              onClick={() => toast('Joylashuv tekshiruvi', { description: position })}
            >
              Ko‘rsatish
            </Button>
          </DemoRow>
        </DemoSection>
      </DemoPage>
    </>
  );
}
