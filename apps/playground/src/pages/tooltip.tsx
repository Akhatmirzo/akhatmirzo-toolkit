import { Button, IconButton, Tooltip } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Tooltip', group: 'Overlay', order: 6 };

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const copy = 'M8 8h12v12H8zM16 8V4H4v12h4';
const share = 'M4 12v8h16v-8M12 3v13M7 8l5-5 5 5';
const heart = 'M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6';
const trash = 'M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3';

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <DemoPage
      title="Tooltip"
      description={
        <>
          Qisqa izoh: hover yoki klaviatura fokusida 300ms dan keyin chiqadi. Teskari rangda, ichida
          bosiladigan element bo'lmaydi (unda Popover). Ilova ildiziga bitta{' '}
          <Code>TooltipProvider</Code> qo'yilsa — qo'shnisiga kechikishsiz o'tadi.
        </>
      }
    >
      <DemoSection
        title="Asosiy"
        description="Tugmalar orasida yurib ko'ring — birinchisidan keyin kechikish yo'q (skip delay)."
      >
        <DemoRow>
          <Tooltip content="Nusxa olish" shortcut={['mod', 'C']}>
            <IconButton variant="outline" aria-label="Nusxa olish">
              <Icon d={copy} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Ulashish">
            <IconButton variant="outline" aria-label="Ulashish">
              <Icon d={share} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Sevimlilarga qo'shish">
            <IconButton variant="outline" aria-label="Sevimlilar">
              <Icon d={heart} />
            </IconButton>
          </Tooltip>
          <Tooltip content="O'chirish" shortcut={['Del']}>
            <IconButton variant="ghost" aria-label="O'chirish">
              <Icon d={trash} />
            </IconButton>
          </Tooltip>
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Tomonlar"
        description="Default — top. Ekran chetiga yetsa, avtomatik teskari tomonga o'tadi."
      >
        <DemoRow>
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <Tooltip key={side} content={`Tomon: ${side}`} side={side}>
              <Button variant="outline">{side}</Button>
            </Tooltip>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="Kechikish va uzun matn">
        <DemoRow>
          <Tooltip content="Darhol chiqadi" delay={0}>
            <Button variant="soft">delay=0</Button>
          </Tooltip>
          <Tooltip content="Bir soniya kutadi" delay={1000}>
            <Button variant="soft">delay=1000</Button>
          </Tooltip>
          <Tooltip content="Uzun izoh 240px dan oshsa keyingi qatorga o'raladi: buyurtma holati har 5 daqiqada yangilanadi.">
            <Button variant="soft">Uzun matn</Button>
          </Tooltip>
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Holatlar"
        description={
          <>
            Boshqariladigan rejim (<Code>open</Code> + <Code>onOpenChange</Code>) va{' '}
            <Code>disabled</Code>. Disabled tugmaga tooltip kerak bo'lsa — uni <Code>span</Code> ga
            o'rang.
          </>
        }
      >
        <DemoRow>
          <Button variant="outline" onClick={() => setOpen((o) => !o)}>
            {open ? 'Yopish' : "Ko'rsatish"}
          </Button>
          <Tooltip content="Boshqariladigan tooltip" open={open} onOpenChange={setOpen}>
            <Button variant="soft">Nishon</Button>
          </Tooltip>
          <Tooltip content="Ko'rinmaydi" disabled>
            <Button variant="soft">disabled tooltip</Button>
          </Tooltip>
          <Tooltip content="Ruxsat yo'q: faqat administrator">
            <span tabIndex={0} className="inline-flex rounded-lg focus-ring">
              <Button variant="primary" disabled>
                Saqlash
              </Button>
            </span>
          </Tooltip>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
