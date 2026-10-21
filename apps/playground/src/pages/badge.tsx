import { Badge, type BadgeColor } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Badge', group: "Ko'rsatish", order: 1 };

const colors: { color: BadgeColor; label: string }[] = [
  { color: 'neutral', label: 'Neutral' },
  { color: 'primary', label: 'Yangi' },
  { color: 'success', label: 'Faol' },
  { color: 'warning', label: 'Kutilmoqda' },
  { color: 'danger', label: 'Bekor qilindi' },
  { color: 'info', label: "Ma'lumot" },
];

const variants = ['soft', 'solid', 'outline'] as const;

const initialTags = ['React', 'TypeScript', 'Tailwind', 'Vite'];

export default function Page() {
  const [tags, setTags] = useState(initialTags);

  return (
    <DemoPage
      title="Badge"
      description="Holat, kategoriya va filtr teglari uchun kichik yorliq. Radius full, matn text-xs 500."
    >
      <DemoSection
        title="Variantlar va ranglar"
        description="variant: soft (default), solid, outline"
      >
        {variants.map((variant) => (
          <DemoRow key={variant} label={variant}>
            {colors.map(({ color, label }) => (
              <Badge key={color} variant={variant} color={color}>
                {label}
              </Badge>
            ))}
          </DemoRow>
        ))}
      </DemoSection>

      <DemoSection title="O'lchamlar">
        <DemoRow label="sm">
          {colors.map(({ color, label }) => (
            <Badge key={color} size="sm" color={color}>
              {label}
            </Badge>
          ))}
        </DemoRow>
        <DemoRow label="md (default)">
          {colors.map(({ color, label }) => (
            <Badge key={color} color={color}>
              {label}
            </Badge>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="Nuqta" description={<Code>dot</Code>}>
        {variants.map((variant) => (
          <DemoRow key={variant} label={variant}>
            {colors.map(({ color, label }) => (
              <Badge key={color} dot variant={variant} color={color}>
                {label}
              </Badge>
            ))}
          </DemoRow>
        ))}
      </DemoSection>

      <DemoSection
        title="Olib tashlash"
        description={
          <>
            <Code>onRemove</Code> berilsa ✕ tugmasi chiqadi — Tab bilan fokuslab, Enter/Space bilan
            bosing
          </>
        }
      >
        <DemoRow label="Filtr teglari">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              onRemove={() => setTags((t) => t.filter((x) => x !== tag))}
              labels={{ remove: `${tag} tegini olib tashlash` }}
            >
              {tag}
            </Badge>
          ))}
          {tags.length === 0 && <span className="text-sm text-text-muted">Teglar qolmadi</span>}
          {tags.length < initialTags.length && (
            <button
              type="button"
              onClick={() => setTags(initialTags)}
              className="focus-ring rounded-md bg-transparent px-2 text-sm font-medium text-primary-soft-foreground hover:underline"
            >
              Qaytarish
            </button>
          )}
        </DemoRow>
        <DemoRow label="Ranglar bilan">
          {colors.map(({ color, label }) => (
            <Badge key={color} color={color} size="sm" onRemove={() => {}}>
              {label}
            </Badge>
          ))}
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
