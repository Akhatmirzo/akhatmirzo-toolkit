import { searchMatch } from '@akhatmirzo/core';
import {
  Button,
  CommandPalette,
  Kbd,
  toast,
  type CommandPaletteGroup,
  type CommandPaletteItem,
} from '@akhatmirzo/ui';
import { useState, type ReactNode } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';
import { applyTheme } from '../theme';

export const meta: PageMeta = { title: 'CommandPalette', group: 'Overlay', order: 7 };

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

const icons = {
  home: (
    <Icon>
      <path d="M3 11 12 4l9 7M5 10v10h14V10" />
    </Icon>
  ),
  box: (
    <Icon>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </Icon>
  ),
  users: (
    <Icon>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 6" />
    </Icon>
  ),
  user: (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
  ),
  chart: (
    <Icon>
      <path d="M4 20h16M7 16v-5M12 16V7M17 16v-8" />
    </Icon>
  ),
  settings: (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </Icon>
  ),
  plus: (
    <Icon>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  ),
  userPlus: (
    <Icon>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6" />
    </Icon>
  ),
  sheet: (
    <Icon>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5M8 13h8M8 17h8M12 11v8" />
    </Icon>
  ),
  moon: (
    <Icon>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </Icon>
  ),
  sun: (
    <Icon>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  ),
  globe: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Icon>
  ),
  search: (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  ),
};

const customers = [
  'Aziza Karimova',
  'Bobur Toshmatov',
  'Dilnoza Rahimova',
  "G'ayrat Usmonov",
  'Jasur Qodirov',
  'Malika Yusupova',
  'Otabek Nurmatov',
  'Sardor Aliyev',
];

function done(label: string) {
  toast(`"${label}" bajarildi`);
}

const groups: CommandPaletteGroup[] = [
  {
    heading: 'Sahifalar',
    items: [
      { label: 'Bosh sahifa', icon: icons.home, onSelect: () => done('Bosh sahifa') },
      {
        label: 'Buyurtmalar',
        icon: icons.box,
        keywords: ['zakaz', 'savdo'],
        onSelect: () => done('Buyurtmalar'),
      },
      { label: 'Mijozlar', icon: icons.users, onSelect: () => done('Mijozlar') },
      {
        label: 'Hisobotlar',
        icon: icons.chart,
        keywords: ['statistika'],
        onSelect: () => done('Hisobotlar'),
      },
      {
        label: 'Sozlamalar',
        icon: icons.settings,
        shortcut: ['mod', ','],
        onSelect: () => done('Sozlamalar'),
      },
    ],
  },
  {
    heading: 'Amallar',
    items: [
      {
        label: 'Yangi buyurtma',
        icon: icons.plus,
        shortcut: ['mod', 'N'],
        onSelect: () => done('Yangi buyurtma'),
      },
      { label: "Mijoz qo'shish", icon: icons.userPlus, onSelect: () => done("Mijoz qo'shish") },
      {
        label: 'Eksport (Excel)',
        icon: icons.sheet,
        keywords: ['yuklab olish', 'xlsx'],
        onSelect: () => done('Eksport (Excel)'),
      },
      {
        label: 'Mavzuni almashtirish',
        icon: icons.moon,
        keywords: ['tungi rejim', 'dark'],
        page: {
          title: 'Mavzu',
          placeholder: 'Mavzu tanlang...',
          groups: [
            {
              heading: 'Mavzu',
              items: [
                {
                  id: 'theme-light',
                  label: "Yorug'",
                  icon: icons.sun,
                  onSelect: () => applyTheme('light'),
                },
                {
                  id: 'theme-dark',
                  label: "Qorong'i",
                  icon: icons.moon,
                  onSelect: () => applyTheme('dark'),
                },
              ],
            },
          ],
        },
      },
      {
        label: 'Tilni almashtirish',
        icon: icons.globe,
        page: {
          title: 'Til',
          groups: [
            {
              heading: 'Til',
              items: [
                { id: 'lang-uz', label: "O'zbekcha", onSelect: () => done("O'zbekcha") },
                { id: 'lang-ru', label: 'Русский', onSelect: () => done('Русский') },
                {
                  id: 'lang-en',
                  label: 'English',
                  onSelect: () => done('English'),
                  disabled: true,
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    heading: 'Mijozlar',
    searchOnly: true,
    items: customers.map((name) => ({
      label: name,
      icon: icons.user,
      onSelect: () => done(name),
    })),
  },
];

const serverCustomers = [
  ['Akmal Ergashev', '+998 90 123 45 67'],
  ['Akbar Sobirov', '+998 93 555 12 34'],
  ['Kamola Akramova', '+998 97 700 00 11'],
  ['Shahzod Mirzayev', '+998 99 321 65 87'],
  ['Nodira Ahmedova', '+998 91 444 22 33'],
] as const;

/** Server qidiruvini taqlid qiladi (700ms) */
function fakeSearch(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<CommandPaletteItem[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(
        serverCustomers
          .filter(([name]) => searchMatch(name, query).match)
          .map(([name, phone]) => ({
            id: `server-${name}`,
            label: name,
            description: phone,
            icon: icons.user,
            onSelect: () => done(name),
          })),
      );
    }, 700);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Bekor qilindi', 'AbortError'));
    });
  });
}

export default function Page() {
  const [open, setOpen] = useState(false);
  const [serverOpen, setServerOpen] = useState(false);

  return (
    <DemoPage
      title="CommandPalette"
      description={
        <>
          Global qidiruv va buyruqlar oynasi (<Code>cmdk</Code> + Radix Dialog). Fuzzy qidiruv
          o'zbekcha normallashtirish bilan (<Code>ybu</Code> → "Yangi buyurtma", <Code>qoʻsh</Code>{' '}
          = <Code>qo'sh</Code>, kirill ham topiladi). Klaviatura: <Code>↑ ↓</Code>,{' '}
          <Code>Enter</Code>, <Code>Esc</Code>, ichki sahifada bo'sh qidiruvda{' '}
          <Code>Backspace</Code> — orqaga.
        </>
      }
    >
      <DemoSection
        title="Asosiy"
        description="Sahifaning istalgan joyida Ctrl+K (macOS'da ⌘K) bosing. Tanlangan buyruqlar keyingi safar 'Oxirgi ishlatilganlar' guruhida birinchi chiqadi (localStorage)."
      >
        <DemoRow>
          <CommandPalette groups={groups} open={open} onOpenChange={setOpen}>
            <Button variant="outline" leftIcon={icons.search} className="min-w-60 justify-start">
              <span className="flex-1 text-left text-text-muted">Qidirish...</span>
              <Kbd keys={['mod', 'K']} />
            </Button>
          </CommandPalette>
          <span className="text-sm text-text-muted">Holat: {open ? 'ochiq' : 'yopiq'}</span>
        </DemoRow>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-sm text-text-muted">
          <li>
            "Mijozlar" guruhi faqat qidiruvda ko'rinadi (<Code>searchOnly</Code>) — masalan{' '}
            <Code>aziza</Code>.
          </li>
          <li>
            "Mavzuni almashtirish" va "Tilni almashtirish" — ichki sahifalar (<Code>page</Code>).
          </li>
          <li>
            Kalit so'zlar: <Code>statistika</Code> → Hisobotlar, <Code>xlsx</Code> → Eksport.
          </li>
          <li>
            Bo'sh natija: <Code>qwerty</Code>.
          </li>
        </ul>
      </DemoSection>

      <DemoSection
        title="Server qidiruvi"
        description="onSearch — 300ms debounce, natijalar 'Natijalar' guruhida, kutish paytida Spinner; yangi so'rov eskisini AbortSignal bilan bekor qiladi. Sinang: 'ak', 'nodira'."
      >
        <DemoRow>
          <CommandPalette
            groups={groups.slice(0, 2)}
            open={serverOpen}
            onOpenChange={setServerOpen}
            hotkey={false}
            recentKey="playground:command-palette:server"
            placeholder="Mijoz yoki buyruq qidirish..."
            onSearch={fakeSearch}
            labels={{ results: 'Mijozlar (serverdan)' }}
          >
            <Button variant="soft">Server qidiruvi bilan ochish</Button>
          </CommandPalette>
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Sozlamalar"
        description="Matnlar labels orqali o'zgaradi; hotkey={false} — yorliq o'chiq; recent={false} — oxirgilar saqlanmaydi."
      >
        <DemoRow>
          <CommandPalette
            groups={groups}
            hotkey={false}
            recent={false}
            placeholder="Buyruq kiriting..."
            labels={{
              empty: 'Buyruq topilmadi',
              emptyDescription: (q) => `«${q}» — bunday buyruq yo'q`,
            }}
          >
            <Button variant="outline">Oxirgilarsiz</Button>
          </CommandPalette>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
