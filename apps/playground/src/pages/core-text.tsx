import {
  cyrToLat,
  detectScript,
  fixApostrophes,
  fuzzyMatch,
  latToCyr,
  normalizeUz,
  searchMatch,
  slugify,
  splitByRanges,
  toScript,
  truncate,
  truncateMiddle,
  type TextRange,
} from '@akhatmirzo/core';
import { Badge, Field, Input } from '@akhatmirzo/ui';
import { useMemo, useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Matn', group: 'Funksiyalar', order: 1 };

const CITIES = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Xiva',
  "Farg'ona",
  'Namangan',
  'Andijon',
  'Qarshi',
  'Termiz',
  'Nukus',
  'Guliston',
  'Jizzax',
  'Navoiy',
  'Urganch',
  "Marg'ilon",
  'Qo‘qon',
  'Shahrisabz',
  'Chirchiq',
  'Ғузор',
  'Ўрта Чирчиқ',
  'Шаҳрихон',
];

const COMMANDS = [
  'Yangi buyurtma',
  'Buyurtmalar ro‘yxati',
  'Mijoz qo‘shish',
  'Mijozlar',
  'Hisobotlar',
  'Sozlamalar',
  'Profilni tahrirlash',
  'Mavzuni almashtirish',
  'Chiqish',
  'Ombordagi mahsulotlar',
];

const FILES = [
  'hisobot-oktabr-2026.pdf',
  'shartnoma-mchj-akhatmirzo-imzolangan.docx',
  'rasm_20261021_143522_IMG.jpeg',
  'juda-uzun-nomli-arxiv-fayli-zaxira-nusxa.tar',
];

function Highlight({ text, ranges }: { text: string; ranges: TextRange[] }) {
  return (
    <>
      {splitByRanges(text, ranges).map((s, i) =>
        s.match ? (
          <mark
            key={i}
            className="rounded-sm bg-primary-soft font-semibold text-primary-soft-foreground"
          >
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <code className="min-h-9 rounded-lg border border-border bg-surface-muted px-3 py-2 font-mono text-sm break-all">
        {value || '—'}
      </code>
    </div>
  );
}

export default function Page() {
  const [source, setSource] = useState('Ғузор тумани, Gʻuzor, G‘uzor');
  const [cityQuery, setCityQuery] = useState('шаҳ');
  const [cmdQuery, setCmdQuery] = useState('mq');
  const [slugInput, setSlugInput] = useState("Farg'ona viloyati — 2026");
  const [maxLen, setMaxLen] = useState(22);
  const [scriptInput, setScriptInput] = useState("O'zbekiston g'alabasi, ma'no — Тошкент");

  const cityResults = useMemo(
    () => CITIES.map((city) => ({ city, ...searchMatch(city, cityQuery) })).filter((r) => r.match),
    [cityQuery],
  );

  const cmdResults = useMemo(
    () =>
      COMMANDS.map((label) => ({ label, result: fuzzyMatch(label, cmdQuery) }))
        .filter((r) => r.result !== null)
        .sort((a, b) => b.result!.score - a.result!.score),
    [cmdQuery],
  );

  return (
    <DemoPage
      title="Matn"
      description={
        <>
          <Code>@akhatmirzo/core</Code> matn funksiyalari: o'zbekcha normallashtirish, kirill ↔
          lotin, qidiruv va qisqartirish. Barchasi sof funksiyalar, SSR-xavfsiz.
        </>
      }
    >
      <DemoSection
        title="normalizeUz va transliteratsiya"
        description={
          <>
            <Code>normalizeUz</Code> — qidiruv kaliti: kichik harf, kirill → lotin, apostroflar (ʻ ʼ
            ‘ ’ ` ´ ') olib tashlanadi, kirill <Code>е</Code> doim <Code>e</Code> (so‘z o‘rtasini
            ham topish uchun). <Code>cyrToLat</Code> esa imlo bo‘yicha: <Code>ер</Code> →{' '}
            <Code>yer</Code>.
          </>
        }
      >
        <Field label="Matn">
          <Input value={source} onChange={(e) => setSource(e.target.value)} clearable />
        </Field>
        <DemoGrid min={220}>
          <Result label="normalizeUz" value={normalizeUz(source)} />
          <Result label="cyrToLat" value={cyrToLat(source)} />
          <Result label="latToCyr" value={latToCyr(source)} />
        </DemoGrid>
        <DemoRow label="Tez misollar">
          {['ШАҲАР Шаҳар', "O'zbekiston", 'Ўзбекистон', 'ер, поезд, маъно', "yo'l, Is'hoq"].map(
            (s) => (
              <button key={s} type="button" onClick={() => setSource(s)} className="cursor-pointer">
                <Badge variant="outline">{s}</Badge>
              </button>
            ),
          )}
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="detectScript, toScript va fixApostrophes"
        description={
          <>
            <Code>toScript</Code> faqat boshqa yozuvdagi qismni o'giradi (lotin natijada{' '}
            <Code>oʻ gʻ ʼ</Code>). <Code>fixApostrophes</Code> — o/g dan keyin <Code>ʻ</Code>, so'z
            ichida <Code>ʼ</Code>, qo'shtirnoqlarga tegmaydi.
          </>
        }
      >
        <Field label="Matn">
          <Input value={scriptInput} onChange={(e) => setScriptInput(e.target.value)} clearable />
        </Field>
        <DemoRow label="detectScript">
          <Badge color="info">{detectScript(scriptInput)}</Badge>
        </DemoRow>
        <DemoGrid min={220}>
          <Result label="toScript(s, 'latin')" value={toScript(scriptInput, 'latin')} />
          <Result label="toScript(s, 'cyrillic')" value={toScript(scriptInput, 'cyrillic')} />
          <Result label="fixApostrophes" value={fixApostrophes(scriptInput)} />
          <Result
            label="fixApostrophes ascii"
            value={fixApostrophes(scriptInput, { style: 'ascii' })}
          />
        </DemoGrid>
        <DemoRow label="Tez misollar">
          {[
            "O'zbekiston g'alabasi, ma'no — Тошкент",
            'Салом, дунё',
            "'Salom' dedi, tog' va bog'",
            "ta'lim, san'at, mo''tabar",
            'Oʻzbekiston maʼnosi',
          ].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScriptInput(s)}
              className="cursor-pointer"
            >
              <Badge variant="outline">{s}</Badge>
            </button>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="searchMatch — jonli qidiruv"
        description={
          <>
            Qism satr qidiruvi. <Code>ranges</Code> — asl matndagi indekslar, shuning uchun kirill
            matnda lotin so'rov ham to'g'ri ajratiladi (<Code>sh</Code> → <Code>Ш</Code>).
          </>
        }
      >
        <Field label="Shahar qidirish" description="Masalan: shah, ғуз, fargona, qo'qon, chir, тер">
          <Input value={cityQuery} onChange={(e) => setCityQuery(e.target.value)} clearable />
        </Field>
        <div className="flex flex-wrap gap-2">
          {cityResults.length === 0 && (
            <p className="text-sm text-text-muted">Hech narsa topilmadi</p>
          )}
          {cityResults.map(({ city, ranges }) => (
            <span
              key={city}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
            >
              <Highlight text={city} ranges={ranges} />
            </span>
          ))}
        </div>
        <p className="text-xs text-text-muted">
          {cityResults.length} / {CITIES.length} ta shahar
        </p>
      </DemoSection>

      <DemoSection
        title="fuzzyMatch — Command Palette"
        description="Harflar ketma-ketligi bo'yicha; so'z boshidagi va ketma-ket mosliklar yuqoriroq."
      >
        <Field label="Buyruq" description="Masalan: mq, ybu, hsb, prof">
          <Input value={cmdQuery} onChange={(e) => setCmdQuery(e.target.value)} clearable />
        </Field>
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {cmdResults.length === 0 && (
            <li className="px-3 py-2 text-sm text-text-muted">Hech narsa topilmadi</li>
          )}
          {cmdResults.map(({ label, result }) => (
            <li key={label} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span>
                <Highlight text={label} ranges={result!.ranges} />
              </span>
              <Badge size="sm" color="neutral">
                {result!.score.toFixed(1)}
              </Badge>
            </li>
          ))}
        </ul>
      </DemoSection>

      <DemoSection title="slugify">
        <Field label="Sarlavha">
          <Input value={slugInput} onChange={(e) => setSlugInput(e.target.value)} clearable />
        </Field>
        <Result label="slugify" value={slugify(slugInput)} />
      </DemoSection>

      <DemoSection
        title="truncate va truncateMiddle"
        description={
          <>
            <Code>truncateMiddle</Code> fayl kengaytmasini va nomning oxirini saqlaydi (FileUpload
            uchun).
          </>
        }
      >
        <Field label={`Maksimal uzunlik: ${maxLen}`}>
          <input
            type="range"
            min={4}
            max={40}
            value={maxLen}
            onChange={(e) => setMaxLen(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </Field>
        <div className="flex flex-col gap-3">
          {FILES.map((file) => (
            <DemoGrid key={file} min={220}>
              <Result label="truncateMiddle" value={truncateMiddle(file, maxLen)} />
              <Result label="truncate" value={truncate(file, maxLen)} />
            </DemoGrid>
          ))}
        </div>
      </DemoSection>
    </DemoPage>
  );
}
