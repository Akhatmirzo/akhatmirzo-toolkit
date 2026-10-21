import {
  Button,
  Combobox,
  ConfirmDialog,
  Dialog,
  Field,
  Input,
  Select,
  Switch,
  Textarea,
  confirm,
  type DialogSize,
} from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Dialog', group: 'Overlay', order: 1 };

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
  );
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Oxirgi harakat natijasi */
function Status({ text }: { text: string }) {
  return (
    <p className="text-sm text-text-muted" aria-live="polite">
      Natija: <span className="font-medium text-text">{text}</span>
    </p>
  );
}

function ProfileDialog() {
  const [name, setName] = useState('Sarvar');
  const [phone, setPhone] = useState('+998 90 123 45 67');
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="primary">Profilni tahrirlash</Button>
      </Dialog.Trigger>
      <Dialog.Content title="Profilni tahrirlash" description="O'zgarishlar darhol saqlanadi.">
        <div className="flex flex-col gap-4">
          <Field label="Ism">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Telefon" description="SMS kod yuboriladi">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button>Bekor qilish</Button>
          </Dialog.Close>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Saqlash
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

const cities = [
  { value: 'tsh', label: 'Toshkent' },
  { value: 'sam', label: 'Samarqand' },
  { value: 'bux', label: 'Buxoro' },
  { value: 'and', label: 'Andijon' },
  { value: 'fer', label: "Farg'ona" },
  { value: 'nam', label: 'Namangan' },
];

/** Modal ichidagi suzuvchi panellar: ro'yxat dialog ustida ochilishi kerak */
function AddressDialog() {
  const [city, setCity] = useState<string | null>('tsh');
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline">Manzil (Select + Combobox)</Button>
      </Dialog.Trigger>
      <Dialog.Content
        title="Yetkazib berish manzili"
        description="Ro'yxatlar dialog ustida ochiladi."
      >
        <div className="flex flex-col gap-4">
          <Field label="Shahar">
            <Combobox options={cities} value={city} onValueChange={setCity} clearable />
          </Field>
          <Field label="Yetkazish vaqti">
            <Select defaultValue="morning">
              <Select.Item value="morning">Ertalab (9:00–12:00)</Select.Item>
              <Select.Item value="day">Kunduzi (12:00–17:00)</Select.Item>
              <Select.Item value="evening">Kechqurun (17:00–21:00)</Select.Item>
            </Select>
          </Field>
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button>Bekor qilish</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button variant="primary">Saqlash</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

const sizes: { size: DialogSize; note: string }[] = [
  { size: 'sm', note: '400px' },
  { size: 'md', note: '520px' },
  { size: 'lg', note: '640px' },
  { size: 'xl', note: '800px' },
  { size: 'full', note: 'ekran' },
];

function SizeDialog({ size, note }: { size: DialogSize; note: string }) {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          {size} — {note}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content title={`O'lcham: ${size}`} description={`Kenglik ${note}.`} size={size}>
        <p className="text-sm text-text">
          Dialog kengligi ekrandan katta bo'lsa, chetlarda 16px joy qoladi. Telefonda pastdan
          chiqadi.
        </p>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="primary">Tushunarli</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

function LongDialog() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline">Uzun matn (ichki scroll)</Button>
      </Dialog.Trigger>
      <Dialog.Content
        title="Foydalanish shartlari"
        description="Balandlik 100dvh − 32px dan oshmaydi."
      >
        <div className="flex flex-col gap-3 text-sm text-text">
          {Array.from({ length: 14 }, (_, i) => (
            <p key={i} className="m-0">
              {i + 1}. Xizmatdan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz.
              Buyurtmalar 2–3 ish kuni ichida yetkazib beriladi, to'lov yetkazib berilganda yoki
              onlayn amalga oshiriladi.
            </p>
          ))}
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button>Rad etish</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button variant="primary">Roziman</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

function OptionsDemo() {
  return (
    <DemoRow>
      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="outline">dismissible=false</Button>
        </Dialog.Trigger>
        <Dialog.Content
          title="Majburiy tanlov"
          description="Tashqariga bosish yopmaydi — faqat tugma yoki Esc."
          dismissible={false}
        >
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="primary">Yopish</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="outline">closeButton=false</Button>
        </Dialog.Trigger>
        <Dialog.Content title="✕ tugmasisiz" closeButton={false}>
          <p className="m-0 text-sm text-text">Yopish faqat pastdagi tugma orqali.</p>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="primary">Yopish</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="outline">hideTitle</Button>
        </Dialog.Trigger>
        <Dialog.Content title="Rasm ko'rish" hideTitle size="sm">
          <div className="grid h-40 place-items-center rounded-xl bg-surface-muted text-sm text-text-muted">
            Sarlavha faqat ekran o'quvchi uchun
          </div>
        </Dialog.Content>
      </Dialog>

      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="outline">mobileSheet=false</Button>
        </Dialog.Trigger>
        <Dialog.Content
          title="Doim markazda"
          description="Telefonda ham pastdan chiqmaydi."
          mobileSheet={false}
          size="sm"
        >
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="primary">Yaxshi</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="outline">labels (English)</Button>
        </Dialog.Trigger>
        <Dialog.Content title="Settings" labels={{ close: 'Close' }} size="sm">
          <Switch label="Notifications" defaultChecked />
        </Dialog.Content>
      </Dialog>
    </DemoRow>
  );
}

function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('—');
  const send = async () => {
    setSending(true);
    await wait(1200);
    setSending(false);
    setOpen(false);
    setStatus('Fikr yuborildi');
  };
  return (
    <div className="flex flex-col gap-3">
      <DemoRow>
        <Dialog open={open} onOpenChange={(next) => !sending && setOpen(next)}>
          <Dialog.Trigger asChild>
            <Button>Fikr bildirish</Button>
          </Dialog.Trigger>
          <Dialog.Content title="Fikr bildirish" size="lg" dismissible={!sending}>
            <div className="flex flex-col gap-4">
              <Field label="Mavzu" required>
                <Input placeholder="Masalan: yetkazib berish" />
              </Field>
              <Field label="Xabar" description="Kamida 10 ta belgi">
                <Textarea minRows={4} placeholder="Fikringizni yozing..." />
              </Field>
            </div>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button disabled={sending}>Bekor qilish</Button>
              </Dialog.Close>
              <Button variant="primary" loading={sending} onClick={send}>
                Yuborish
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </DemoRow>
      <Status text={status} />
    </div>
  );
}

function ConfirmDemo() {
  const [status, setStatus] = useState('—');

  const removeOrder = async () => {
    const ok = await confirm({
      title: "Buyurtma o'chirilsinmi?",
      description: "Bu amalni qaytarib bo'lmaydi.",
      confirmText: "O'chirish",
      variant: 'danger',
    });
    setStatus(ok ? "Buyurtma o'chirildi" : 'Bekor qilindi');
  };

  const publish = async () => {
    const ok = await confirm({
      title: 'Mahsulot nashr qilinsinmi?',
      description: "Mahsulot do'konda hammaga ko'rinadi.",
      confirmText: 'Nashr qilish',
      onConfirm: () => wait(1500),
    });
    setStatus(ok ? 'Nashr qilindi (1.5 s kutildi)' : 'Bekor qilindi');
  };

  const failing = async () => {
    let attempt = 0;
    const ok = await confirm({
      title: "To'lov qaytarilsinmi?",
      description: 'Birinchi urinish xato beradi — dialog ochiq qoladi, qayta bosing.',
      confirmText: 'Qaytarish',
      variant: 'danger',
      onConfirm: async () => {
        await wait(800);
        attempt += 1;
        if (attempt === 1) {
          setStatus('Xatolik: qayta urinib ko‘ring');
          throw new Error('tarmoq');
        }
      },
    });
    setStatus(ok ? "To'lov qaytarildi" : 'Bekor qilindi');
  };

  return (
    <div className="flex flex-col gap-3">
      <DemoRow label="confirm() — imperativ">
        <Button variant="danger" leftIcon={<TrashIcon />} onClick={removeOrder}>
          O'chirish
        </Button>
        <Button variant="primary" onClick={publish}>
          Nashr qilish (async)
        </Button>
        <Button variant="outline" onClick={failing}>
          Xato bilan (async)
        </Button>
      </DemoRow>
      <DemoRow label="<ConfirmDialog /> — deklarativ">
        <ConfirmDialog
          trigger={<Button>Chiqish</Button>}
          title="Hisobdan chiqilsinmi?"
          description="Qayta kirish uchun SMS kod kerak bo'ladi."
          confirmText="Chiqish"
          onConfirm={() => setStatus('Hisobdan chiqildi')}
          onCancel={() => setStatus('Qoldingiz')}
        />
        <ConfirmDialog
          trigger={<Button variant="outline">Arxivlash</Button>}
          title="Loyiha arxivlansinmi?"
          confirmText="Arxivlash"
          onConfirm={() => wait(1000).then(() => setStatus('Arxivlandi'))}
        />
      </DemoRow>
      <Status text={status} />
    </div>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="Dialog"
      description={
        <>
          Modal oyna (Radix Dialog asosida). Fokus ichida aylanadi, <Code>Esc</Code> va tashqariga
          bosish yopadi, yopilgach fokus trigger'ga qaytadi. Dastlabki fokus — birinchi input'ga.
          Telefonda (&lt; 640px) pastdan chiqadigan sheet bo'ladi.
        </>
      }
    >
      <DemoSection title="Asosiy" description="Forma bilan: sarlavha, izoh, Footer va Close.">
        <DemoRow>
          <ProfileDialog />
          <AddressDialog />
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="O'lchamlar"
        description={
          <>
            <Code>size</Code>: sm / md (default) / lg / xl / full.
          </>
        }
      >
        <DemoRow>
          {sizes.map((s) => (
            <SizeDialog key={s.size} {...s} />
          ))}
          <LongDialog />
        </DemoRow>
      </DemoSection>

      <DemoSection title="Sozlamalar" description="Yopilish, ✕ tugmasi, sarlavha va matnlar.">
        <OptionsDemo />
      </DemoSection>

      <DemoSection
        title="Holatlar: yuborilmoqda"
        description="Yuborish paytida tugma loading, tashqariga bosish va Esc yopmaydi."
      >
        <FeedbackDialog />
      </DemoSection>

      <DemoSection
        title="ConfirmDialog va confirm()"
        description={
          <>
            <Code>await confirm(&#123;...&#125;)</Code> → <Code>true | false</Code>. Ilovada bir
            marta <Code>&lt;ConfirmProvider /&gt;</Code> qo'yiladi. <Code>danger</Code> da dastlabki
            fokus "Bekor qilish" da; async <Code>onConfirm</Code> tugaguncha dialog yopilmaydi.
          </>
        }
      >
        <ConfirmDemo />
      </DemoSection>
    </DemoPage>
  );
}
