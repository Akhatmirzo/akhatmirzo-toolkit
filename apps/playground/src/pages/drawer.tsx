import {
  Button,
  Checkbox,
  Drawer,
  Field,
  Input,
  Radio,
  RadioGroup,
  Switch,
  type DrawerSide,
  type DrawerSize,
} from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Drawer', group: 'Overlay', order: 2 };

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

const categories = ['Elektronika', 'Kiyim-kechak', 'Uy-ro‘zg‘or', 'Kitoblar'];

function FilterDrawer() {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState('—');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState<string[]>(['Elektronika']);

  const apply = () => {
    setApplied(
      `${from || 0} – ${to || '∞'} so'm · ${selected.length ? selected.join(', ') : 'barcha toifalar'}`,
    );
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <DemoRow>
        <Drawer open={open} onOpenChange={setOpen}>
          <Drawer.Trigger asChild>
            <Button variant="outline" leftIcon={<FilterIcon />}>
              Filtrlar
            </Button>
          </Drawer.Trigger>
          <Drawer.Content title="Filtrlar" description="Natijalarni toraytiring.">
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Narxdan">
                  <Input
                    inputMode="numeric"
                    placeholder="0"
                    suffix="so'm"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </Field>
                <Field label="Narxgacha">
                  <Input
                    inputMode="numeric"
                    placeholder="1 000 000"
                    suffix="so'm"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </Field>
              </div>
              <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
                <legend className="mb-3 p-0 text-sm font-medium text-text">Toifalar</legend>
                {categories.map((c) => (
                  <Checkbox
                    key={c}
                    label={c}
                    checked={selected.includes(c)}
                    onCheckedChange={(on) =>
                      setSelected((prev) => (on ? [...prev, c] : prev.filter((x) => x !== c)))
                    }
                  />
                ))}
              </fieldset>
              <Switch label="Faqat mavjudlari" defaultChecked />
            </div>
            <Drawer.Footer>
              <Button
                onClick={() => {
                  setFrom('');
                  setTo('');
                  setSelected([]);
                }}
              >
                Tozalash
              </Button>
              <Button variant="primary" onClick={apply}>
                Qo'llash
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </DemoRow>
      <p className="text-sm text-text-muted">
        Qo'llangan: <span className="font-medium text-text">{applied}</span>
      </p>
    </div>
  );
}

const sides: { side: DrawerSide; label: string }[] = [
  { side: 'right', label: "O'ngdan (default)" },
  { side: 'left', label: 'Chapdan' },
  { side: 'bottom', label: 'Pastdan' },
  { side: 'top', label: 'Tepadan' },
];

function SideDrawer({ side, label }: { side: DrawerSide; label: string }) {
  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button variant="outline">{label}</Button>
      </Drawer.Trigger>
      <Drawer.Content
        side={side}
        title={label}
        description={
          side === 'bottom'
            ? "Yuqorida tutqich chizig'i bor."
            : `side="${side}" — slide animatsiyasi.`
        }
      >
        <p className="m-0 text-sm text-text">
          Panel ekran chetidan siljib chiqadi (300ms), yopilishda tezroq qaytadi (200ms).
        </p>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="primary">Yopish</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}

const sizes: { size: DrawerSize; note: string }[] = [
  { size: 'sm', note: '320px' },
  { size: 'md', note: '420px' },
  { size: 'lg', note: '560px' },
];

function SizeDrawer({ size, note, side }: { size: DrawerSize; note: string; side: DrawerSide }) {
  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button variant="outline">
          {size} — {note}
        </Button>
      </Drawer.Trigger>
      <Drawer.Content side={side} size={size} title={`O'lcham: ${size}`} description={note}>
        <p className="m-0 text-sm text-text">
          {side === 'bottom' || side === 'top' ? 'Balandlik' : 'Kenglik'}: {note}.
        </p>
      </Drawer.Content>
    </Drawer>
  );
}

function SizesDemo() {
  const [side, setSide] = useState<DrawerSide>('right');
  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        aria-label="Tomon"
        orientation="horizontal"
        value={side}
        onValueChange={(v) => setSide(v as DrawerSide)}
      >
        <Radio value="right" label="O'ng" />
        <Radio value="bottom" label="Past" />
      </RadioGroup>
      <DemoRow>
        {sizes.map((s) => (
          <SizeDrawer key={s.size} side={side} {...s} />
        ))}
      </DemoRow>
    </div>
  );
}

const menu = ['Bosh sahifa', 'Buyurtmalar', 'Mahsulotlar', 'Mijozlar', 'Hisobotlar', 'Sozlamalar'];

function MobileMenu() {
  const [active, setActive] = useState('Buyurtmalar');
  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button variant="ghost" leftIcon={<MenuIcon />}>
          Menyu
        </Button>
      </Drawer.Trigger>
      <Drawer.Content
        side="left"
        size="sm"
        title="Menyu"
        hideTitle
        labels={{ close: 'Menyuni yopish' }}
      >
        <nav aria-label="Asosiy menyu" className="-mx-2 flex flex-col gap-1">
          {menu.map((item) => (
            <Drawer.Close asChild key={item}>
              <button
                type="button"
                data-active={item === active ? '' : undefined}
                onClick={() => setActive(item)}
                className="focus-ring flex h-10 cursor-pointer items-center rounded-lg border-0 bg-transparent px-3 text-left font-sans text-sm font-medium text-text hover:bg-surface-muted data-active:bg-primary-soft data-active:text-primary-soft-foreground"
              >
                {item}
              </button>
            </Drawer.Close>
          ))}
        </nav>
      </Drawer.Content>
    </Drawer>
  );
}

function DetailsDrawer() {
  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button>Buyurtma #1042</Button>
      </Drawer.Trigger>
      <Drawer.Content side="right" size="lg" title="Buyurtma #1042" description="21-oktabr, 14:32">
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          {[
            ['Mijoz', 'Sarvar Abduxoliqov'],
            ['Telefon', '+998 90 123 45 67'],
            ['Manzil', 'Toshkent, Chilonzor tumani, 9-mavze'],
            ["To'lov", 'Naqd, yetkazib berilganda'],
            ['Jami', "1 250 000 so'm"],
          ].map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-text-muted">{k}</dt>
              <dd className="m-0 font-medium text-text">{v}</dd>
            </div>
          ))}
        </dl>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button>Yopish</Button>
          </Drawer.Close>
          <Button variant="primary">Yetkazildi deb belgilash</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="Drawer"
      description={
        <>
          Ekran chetidan chiqadigan panel (Sheet). API Dialog bilan bir xil:{' '}
          <Code>Drawer.Trigger</Code>, <Code>Drawer.Content</Code>, <Code>Drawer.Footer</Code>,{' '}
          <Code>Drawer.Close</Code>. Fokus ichida aylanadi, sahifa scroll qilinmaydi.
        </>
      }
    >
      <DemoSection title="Filtrlar paneli" description="Eng ko'p uchraydigan ishlatilish.">
        <FilterDrawer />
      </DemoSection>

      <DemoSection
        title="Tomonlar"
        description={
          <>
            <Code>side</Code>: right / left / bottom / top.
          </>
        }
      >
        <DemoRow>
          {sides.map((s) => (
            <SideDrawer key={s.side} {...s} />
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="O'lchamlar"
        description="320 / 420 / 560px — chap/o'ngda kenglik, past/tepada balandlik."
      >
        <SizesDemo />
      </DemoSection>

      <DemoSection title="Real misollar" description="Mobil menyu va tafsilotlar ko'rinishi.">
        <DemoRow>
          <MobileMenu />
          <DetailsDrawer />
          <Drawer>
            <Drawer.Trigger asChild>
              <Button variant="outline">dismissible=false</Button>
            </Drawer.Trigger>
            <Drawer.Content
              title="Saqlanmagan o'zgarishlar"
              description="Tashqariga bosish yopmaydi — faqat tugma yoki Esc."
              dismissible={false}
            >
              <Drawer.Footer>
                <Drawer.Close asChild>
                  <Button variant="primary">Tushunarli</Button>
                </Drawer.Close>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
