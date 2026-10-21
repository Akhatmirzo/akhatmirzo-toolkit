import { Button, DropdownMenu, IconButton } from '@akhatmirzo/ui';
import { useState, type ReactNode } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'DropdownMenu', group: 'Overlay', order: 3 };

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const EditIcon = () => (
  <Icon>
    <path d="M12 20h9" />
    <path d="M16.4 3.6a2 2 0 0 1 2.9 2.9L7 18.8 3 20l1.2-4z" />
  </Icon>
);
const CopyIcon = () => (
  <Icon>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Icon>
);
const ArchiveIcon = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" />
  </Icon>
);
const TrashIcon = () => (
  <Icon>
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Icon>
);
const ShareIcon = () => (
  <Icon>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
  </Icon>
);
const UserIcon = () => (
  <Icon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);
const SettingsIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15.4H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Icon>
);
const LogoutIcon = () => (
  <Icon>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Icon>
);
const DotsIcon = () => (
  <Icon>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </Icon>
);
const ChevronDownIcon = () => (
  <Icon>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export default function Page() {
  const [last, setLast] = useState<string>('—');
  const [columns, setColumns] = useState({ price: true, stock: true, sku: false });
  const [sort, setSort] = useState('new');
  const [open, setOpen] = useState(false);

  return (
    <DemoPage
      title="DropdownMenu"
      description={
        <>
          Amallar menyusi (Radix asosida). Klaviatura: <Code>↑ ↓</Code> aylanma, <Code>Home</Code>/
          <Code>End</Code>, harf bilan typeahead, <Code>→ ←</Code> ichki menyu, <Code>Esc</Code> —
          yopish va fokus trigger'ga.
        </>
      }
    >
      <DemoSection
        title="Asosiy"
        description="Ikonka chapda, Kbd yorlig'i o'ngda, xavfli element alohida rangda."
      >
        <DemoRow>
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline" rightIcon={<ChevronDownIcon />}>
                Amallar
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                icon={<EditIcon />}
                shortcut={['mod', 'E']}
                onSelect={() => setLast('Tahrirlash')}
              >
                Tahrirlash
              </DropdownMenu.Item>
              <DropdownMenu.Item
                icon={<CopyIcon />}
                shortcut={['mod', 'D']}
                onSelect={() => setLast('Nusxa olish')}
              >
                Nusxa olish
              </DropdownMenu.Item>
              <DropdownMenu.Item icon={<ArchiveIcon />} onSelect={() => setLast('Arxivlash')}>
                Arxivlash
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                icon={<TrashIcon />}
                variant="danger"
                onSelect={() => setLast("O'chirish")}
              >
                O'chirish
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
          <span className="text-sm text-text-muted">
            Oxirgi tanlov: <strong className="text-text">{last}</strong>
          </span>
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Joylashuv"
        description="side: top | right | bottom | left, align: start | center | end. Ekran chetida avtomatik teskari tomonga o'tadi."
      >
        <DemoRow>
          {(['bottom', 'top', 'right', 'left'] as const).map((side) => (
            <DropdownMenu key={side}>
              <DropdownMenu.Trigger>side="{side}"</DropdownMenu.Trigger>
              <DropdownMenu.Content side={side}>
                <DropdownMenu.Item>Birinchi</DropdownMenu.Item>
                <DropdownMenu.Item>Ikkinchi</DropdownMenu.Item>
                <DropdownMenu.Item>Uchinchi</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          ))}
        </DemoRow>
        <DemoRow label="align">
          {(['start', 'center', 'end'] as const).map((align) => (
            <DropdownMenu key={align}>
              <DropdownMenu.Trigger className="w-48">align="{align}"</DropdownMenu.Trigger>
              <DropdownMenu.Content align={align}>
                <DropdownMenu.Item>Profil</DropdownMenu.Item>
                <DropdownMenu.Item>Sozlamalar</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Belgilash: CheckboxItem va RadioGroup"
        description="Menyu tanlovdan keyin yopiladi; ochiq qoldirish uchun onSelect ichida e.preventDefault()."
      >
        <DemoRow>
          <DropdownMenu>
            <DropdownMenu.Trigger>Ustunlar</DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>Jadvalda ko'rsatish</DropdownMenu.Label>
              <DropdownMenu.CheckboxItem
                checked={columns.price}
                onCheckedChange={(v) => setColumns((c) => ({ ...c, price: v }))}
                onSelect={(e) => e.preventDefault()}
              >
                Narx
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.CheckboxItem
                checked={columns.stock}
                onCheckedChange={(v) => setColumns((c) => ({ ...c, stock: v }))}
                onSelect={(e) => e.preventDefault()}
              >
                Ombordagi soni
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.CheckboxItem
                checked={columns.sku}
                onCheckedChange={(v) => setColumns((c) => ({ ...c, sku: v }))}
                onSelect={(e) => e.preventDefault()}
              >
                Artikul
              </DropdownMenu.CheckboxItem>
            </DropdownMenu.Content>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenu.Trigger>Saralash</DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>Tartib</DropdownMenu.Label>
              <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
                <DropdownMenu.RadioItem value="new">Avval yangilari</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="cheap">Avval arzonlari</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="expensive">Avval qimmatlari</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="popular" disabled>
                  Ommabop (tez orada)
                </DropdownMenu.RadioItem>
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu>
          <span className="text-sm text-text-muted">
            Saralash: <Code>{sort}</Code> · ustunlar:{' '}
            <Code>
              {Object.entries(columns)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join(', ') || '—'}
            </Code>
          </span>
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Ichki menyu (Sub)"
        description="→ ochadi, ← yopadi; sichqoncha bilan hover."
      >
        <DemoRow>
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <IconButton variant="outline" aria-label="Ko'proq amallar">
                <DotsIcon />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              <DropdownMenu.Item icon={<EditIcon />}>Nomini o'zgartirish</DropdownMenu.Item>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger icon={<ShareIcon />}>Ulashish</DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.Item>Telegram</DropdownMenu.Item>
                  <DropdownMenu.Item>Email orqali</DropdownMenu.Item>
                  <DropdownMenu.Item shortcut={['mod', 'L']}>Havolani nusxalash</DropdownMenu.Item>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger icon={<ArchiveIcon />}>Ko'chirish</DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.Item>Kiruvchi</DropdownMenu.Item>
                  <DropdownMenu.Item>Arxiv</DropdownMenu.Item>
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger>Loyihalar</DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent>
                      <DropdownMenu.Item>Do'kon</DropdownMenu.Item>
                      <DropdownMenu.Item>Ombor</DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Sub>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
              <DropdownMenu.Separator />
              <DropdownMenu.Item icon={<TrashIcon />} variant="danger">
                O'chirish
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Holatlar"
        description="disabled element o'tkazib yuboriladi; trigger ham o'chirilishi mumkin."
      >
        <DemoRow>
          <DropdownMenu>
            <DropdownMenu.Trigger>Disabled elementlar</DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item icon={<EditIcon />}>Tahrirlash</DropdownMenu.Item>
              <DropdownMenu.Item icon={<CopyIcon />} disabled>
                Nusxa olish (ruxsat yo'q)
              </DropdownMenu.Item>
              <DropdownMenu.Item icon={<TrashIcon />} variant="danger" disabled>
                O'chirish (ruxsat yo'q)
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenu.Trigger disabled>Trigger o'chiq</DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>—</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Boshqariladigan rejim"
        description={
          <>
            <Code>open</Code> + <Code>onOpenChange</Code> — tashqaridan ochish/yopish.
          </>
        }
      >
        <DemoRow>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenu.Trigger>Menyu</DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>Birinchi</DropdownMenu.Item>
              <DropdownMenu.Item>Ikkinchi</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
          <Button variant="ghost" onClick={() => setOpen(true)}>
            Tashqaridan ochish
          </Button>
          <span className="text-sm text-text-muted">
            open: <Code>{String(open)}</Code>
          </span>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Real misol: profil menyusi">
        <DemoRow>
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" leftIcon={<UserIcon />}>
                Akmal Karimov
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" className="w-56">
              <DropdownMenu.Label>akmal@misol.uz</DropdownMenu.Label>
              <DropdownMenu.Group>
                <DropdownMenu.Item icon={<UserIcon />} shortcut={['mod', 'P']}>
                  Profil
                </DropdownMenu.Item>
                <DropdownMenu.Item icon={<SettingsIcon />} shortcut={['mod', ',']}>
                  Sozlamalar
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild icon={<ShareIcon />}>
                  <a href="#/dropdown-menu">Do'stni taklif qilish</a>
                </DropdownMenu.Item>
              </DropdownMenu.Group>
              <DropdownMenu.Separator />
              <DropdownMenu.Item icon={<LogoutIcon />} variant="danger">
                Chiqish
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
