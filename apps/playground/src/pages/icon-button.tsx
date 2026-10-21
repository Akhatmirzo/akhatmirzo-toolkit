import { IconButton, type IconButtonProps } from '@akhatmirzo/ui';
import { DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'IconButton', group: 'Asoslar', order: 2 };

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
const X = () => (
  <svg {...svg}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const Trash = () => (
  <svg {...svg}>
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
);

const variants: NonNullable<IconButtonProps['variant']>[] = [
  'primary',
  'soft',
  'outline',
  'ghost',
  'danger',
];

export default function Page() {
  return (
    <DemoPage
      title="IconButton"
      description="Faqat ikonkali kvadrat tugma (32 / 40 / 48). aria-label TypeScript orqali majburiy."
    >
      <DemoSection title="Variantlar">
        <DemoRow>
          {variants.map((v) => (
            <IconButton key={v} variant={v} aria-label={`Qo'shish (${v})`}>
              <Plus />
            </IconButton>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="O'lchamlar"
        description="sm da ko'rinmas bosish maydoni 40px gacha kengaytirilgan."
      >
        {(['outline', 'ghost'] as const).map((v) => (
          <DemoRow key={v} label={v}>
            <IconButton variant={v} size="sm" aria-label="Yopish">
              <X />
            </IconButton>
            <IconButton variant={v} size="md" aria-label="Yopish">
              <X />
            </IconButton>
            <IconButton variant={v} size="lg" aria-label="Yopish">
              <X />
            </IconButton>
          </DemoRow>
        ))}
      </DemoSection>

      <DemoSection title="Holatlar">
        <DemoRow label="loading">
          <IconButton variant="primary" loading aria-label="Saqlanmoqda">
            <Plus />
          </IconButton>
          <IconButton variant="outline" loading aria-label="Saqlanmoqda">
            <Plus />
          </IconButton>
          <IconButton variant="danger" size="lg" loading aria-label="O'chirilmoqda">
            <Trash />
          </IconButton>
        </DemoRow>
        <DemoRow label="disabled">
          {variants.map((v) => (
            <IconButton key={v} variant={v} disabled aria-label="O'chirish">
              <Trash />
            </IconButton>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="Moslashtirish" description="className orqali — masalan, dumaloq.">
        <DemoRow>
          <IconButton variant="soft" className="rounded-full" aria-label="Qo'shish">
            <Plus />
          </IconButton>
          <IconButton variant="primary" size="lg" className="rounded-full" aria-label="Qo'shish">
            <Plus />
          </IconButton>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
