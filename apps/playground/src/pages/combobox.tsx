import { searchMatch } from '@akhatmirzo/core';
import { Combobox, Field, type ComboboxOption } from '@akhatmirzo/ui';
import { useRef, useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Combobox', group: 'Formalar', order: 5 };

const cities: ComboboxOption[] = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Xiva',
  'Namangan',
  'Andijon',
  "Farg'ona",
  "Qo'qon",
  "Marg'ilon",
  'Nukus',
  'Qarshi',
  'Termiz',
  'Jizzax',
  'Guliston',
  'Navoiy',
  'Gʻuzor',
  'Shahrisabz',
  'Chirchiq',
  'Olmaliq',
  'Angren',
].map((label) => ({ value: label.toLowerCase().replace(/[ʻ']/g, ''), label }));

function Dot({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className}>
      <circle cx="8" cy="8" r="5" fill="currentColor" />
    </svg>
  );
}

const statuses: ComboboxOption[] = [
  {
    value: 'new',
    label: 'Yangi',
    description: 'Buyurtma qabul qilindi',
    icon: <Dot className="text-info" />,
  },
  {
    value: 'packing',
    label: "Yig'ilmoqda",
    description: 'Omborda tayyorlanmoqda',
    icon: <Dot className="text-warning" />,
  },
  {
    value: 'shipping',
    label: "Yo'lda",
    description: 'Kuryerga topshirildi',
    icon: <Dot className="text-primary" />,
  },
  {
    value: 'done',
    label: 'Yetkazildi',
    description: 'Mijoz qabul qildi',
    icon: <Dot className="text-success" />,
  },
  {
    value: 'cancelled',
    label: 'Bekor qilingan',
    description: 'Arxivlangan holat',
    icon: <Dot className="text-danger" />,
    disabled: true,
  },
];

const initialTags: ComboboxOption[] = [
  'dizayn',
  'frontend',
  'backend',
  'mobil',
  'test',
  'devops',
].map((t) => ({ value: t, label: t }));

/** Server qidiruvini taqlid qiladi */
function useFakeServer() {
  const [options, setOptions] = useState<ComboboxOption[]>(cities.slice(0, 5));
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const search = (q: string) => {
    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      setOptions(q ? cities.filter((c) => searchMatch(c.label, q).match) : cities.slice(0, 5));
      setLoading(false);
    }, 700);
  };
  return { options, loading, search };
}

export default function Page() {
  const [city, setCity] = useState<string | null>(null);
  const [many, setMany] = useState<string[]>(['toshkent', 'samarqand']);
  const [tags, setTags] = useState<ComboboxOption[]>(initialTags);
  const [chosenTags, setChosenTags] = useState<string[]>(['frontend']);
  const [queries, setQueries] = useState<string[]>([]);
  const server = useFakeServer();

  return (
    <DemoPage
      title="Combobox"
      description={
        <>
          Qidiruvli tanlash (Radix Popover + <Code>cmdk</Code>). Qidiruv o'zbek harflariga sezgir
          emas: <Code>gʻ</Code> = <Code>g'</Code> = <Code>g‘</Code>, kirill ↔ lotin ham topiladi.
          Klaviatura: yozish — qidiruv, <Code>↑ ↓</Code>, <Code>Enter</Code>, <Code>Esc</Code> —
          avval qidiruvni tozalaydi, keyin yopadi.
        </>
      }
    >
      <DemoSection title="Asosiy" description={'Sinang: "farg", "gʻuzor", "Тошкент", "qoqon".'}>
        <DemoGrid min={260}>
          <Field label="Shahar" description={city ? `Qiymat: ${city}` : 'Hali tanlanmagan'}>
            <Combobox
              options={cities}
              value={city}
              onValueChange={setCity}
              placeholder="Shahar tanlang"
              clearable
            />
          </Field>
          <Field label="Holat">
            <Combobox options={statuses} defaultValue="packing" leftIcon={null} />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Bir nechta tanlov (multiple)"
        description={
          <>
            Tanlanganlar Badge sifatida; <Code>Backspace</Code> bo'sh qidiruvda oxirgisini
            o'chiradi.
          </>
        }
      >
        <DemoGrid min={300}>
          <Field label="Filiallar" description={`${many.length} ta tanlangan`}>
            <Combobox
              multiple
              options={cities}
              value={many}
              onValueChange={setMany}
              placeholder="Shaharlarni tanlang"
            />
          </Field>
          <Field label="Teglar" description="Yangi teg yozib, yaratish mumkin (creatable).">
            <Combobox
              multiple
              creatable
              options={tags}
              value={chosenTags}
              onValueChange={setChosenTags}
              onCreate={(text) => {
                const option = { value: text.toLowerCase(), label: text };
                setTags((t) => [...t, option]);
                return option;
              }}
              placeholder="Teg qo'shing"
              leftIcon={null}
            />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Server qidiruvi"
        description={
          <>
            <Code>onSearch</Code> 300ms debounce bilan chaqiriladi, mahalliy filtr o'chadi;{' '}
            <Code>loading</Code> paytida Spinner.
          </>
        }
      >
        <DemoGrid min={300}>
          <Field label="Shahar (serverdan)">
            <Combobox
              options={server.options}
              loading={server.loading}
              onSearch={(q) => {
                setQueries((list) => [q || "(bo'sh)", ...list].slice(0, 4));
                server.search(q);
              }}
              placeholder="Qidirib tanlang"
              searchPlaceholder="Shahar nomi..."
              emptyText="Server hech narsa qaytarmadi"
            />
          </Field>
          <div className="flex flex-col gap-1 text-sm text-text-muted">
            <span className="font-medium text-text">Oxirgi so'rovlar:</span>
            {queries.length === 0 ? (
              <span>—</span>
            ) : (
              queries.map((q, i) => <span key={i}>{q}</span>)
            )}
          </div>
        </DemoGrid>
      </DemoSection>

      <DemoSection title="O'lchamlar" description="Input bilan bir xil: 32 / 40 / 48 px.">
        <DemoGrid min={220}>
          <Combobox size="sm" options={cities} aria-label="sm" placeholder="sm — 32px" />
          <Combobox size="md" options={cities} aria-label="md" placeholder="md — 40px" />
          <Combobox size="lg" options={cities} aria-label="lg" placeholder="lg — 48px" />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Holatlar">
        <DemoGrid min={240}>
          <Field label="Disabled" disabled>
            <Combobox options={cities} defaultValue="toshkent" />
          </Field>
          <Field label="Xato" error="Shaharni tanlang" required>
            <Combobox options={cities} placeholder="Shahar tanlang" />
          </Field>
          <Field label="Yuklanmoqda">
            <Combobox options={[]} loading placeholder="Ochib ko'ring" />
          </Field>
          <Field label="Matnlar o'zgartirilgan">
            <Combobox
              options={cities}
              placeholder="Manzilni belgilang"
              searchPlaceholder="Izlash..."
              emptyText="Natija yo'q"
              labels={{ search: 'Izlash', list: 'Shaharlar' }}
            />
          </Field>
        </DemoGrid>
      </DemoSection>
    </DemoPage>
  );
}
