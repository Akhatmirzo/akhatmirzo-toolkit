import { Button, type ButtonVariant } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Button', group: 'Asoslar', order: 1 };

const svg = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const Plus = () => (
  <svg {...svg}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const Arrow = () => (
  <svg {...svg}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const Trash = () => (
  <svg {...svg}>
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
);

const variants: ButtonVariant[] = ['primary', 'soft', 'outline', 'ghost', 'danger', 'link'];

function LoadingDemo() {
  const [loading, setLoading] = useState(false);
  const run = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };
  return (
    <Button variant="primary" loading={loading} onClick={run}>
      Saqlash
    </Button>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="Button"
      description={
        <>
          Harakatni ishga tushirish. Default varianti — <Code>soft</Code>; <Code>primary</Code>{' '}
          sahifada bitta asosiy harakat uchun.
        </>
      }
    >
      <DemoSection title="Variantlar" description="Hover va bosib ko'ring (scale 0.97).">
        <DemoRow>
          {variants.map((v) => (
            <Button key={v} variant={v}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="O'lchamlar" description="32 / 40 / 48px — Input bilan bir qatorda tekis.">
        {variants.slice(0, 3).map((v) => (
          <DemoRow key={v} label={v}>
            <Button variant={v} size="sm">
              sm · 32
            </Button>
            <Button variant={v} size="md">
              md · 40
            </Button>
            <Button variant={v} size="lg">
              lg · 48
            </Button>
          </DemoRow>
        ))}
      </DemoSection>

      <DemoSection
        title="Ikonkalar"
        description={
          <>
            <Code>leftIcon</Code> va <Code>rightIcon</Code> — o'lchamga qarab 16 / 18 / 20px.
          </>
        }
      >
        <DemoRow>
          <Button variant="primary" leftIcon={<Plus />}>
            Qo'shish
          </Button>
          <Button rightIcon={<Arrow />}>Davom etish</Button>
          <Button variant="outline" size="sm" leftIcon={<Plus />}>
            Kichik
          </Button>
          <Button variant="danger" size="lg" leftIcon={<Trash />}>
            O'chirish
          </Button>
          <Button variant="link" rightIcon={<Arrow />}>
            Batafsil
          </Button>
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Holatlar"
        description="Loading — kenglik o'zgarmaydi, ustida spinner, aria-busy. Disabled — 50% shaffof."
      >
        <DemoRow label="loading (birinchisini bosib ko'ring)">
          <LoadingDemo />
          {variants.slice(1, 5).map((v) => (
            <Button key={v} variant={v} loading>
              Saqlanmoqda
            </Button>
          ))}
          <Button size="lg" variant="primary" loading leftIcon={<Plus />}>
            Katta
          </Button>
        </DemoRow>
        <DemoRow label="disabled">
          {variants.map((v) => (
            <Button key={v} variant={v} disabled>
              Disabled
            </Button>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="To'liq kenglik" description={<Code>fullWidth</Code>}>
        <div className="flex max-w-sm flex-col gap-3">
          <Button variant="primary" fullWidth>
            Kirish
          </Button>
          <Button variant="outline" fullWidth>
            Ro'yxatdan o'tish
          </Button>
        </div>
      </DemoSection>

      <DemoSection
        title="asChild"
        description={
          <>
            Element <Code>{'<a>'}</Code>, stil esa Button niki.
          </>
        }
      >
        <DemoRow>
          <Button asChild variant="outline" rightIcon={<Arrow />}>
            <a href="#/kbd">Kbd sahifasiga</a>
          </Button>
          <Button asChild variant="link">
            <a href="#/spinner">Spinner haqida</a>
          </Button>
          <Button asChild disabled>
            <a href="#/overview">O'chirilgan havola</a>
          </Button>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
