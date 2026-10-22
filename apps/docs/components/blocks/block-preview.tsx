import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { blocks } from '@/components/blocks/registry.generated';
import { getDictionary } from '@/lib/dictionary';
import type { Lang } from '@/lib/i18n';
import { BlockFrame } from './block-frame';

export interface BlockPreviewProps {
  /** Blok nomi = `blocks/<name>/` papkasi: `"login"` */
  name: string;
  /**
   * Ko'rinish ramkasining qat'iy balandligi (px). Berilsa, blok ramka ichida aylanadi va
   * `AppShell` balandligi shu qiymatga tenglanadi (to'liq ekranli qoliplar uchun).
   */
  height?: number;
  /**
   * Kenglik almashtirgich va qo'lda o'lchash. `false` — viewport media so'rovlariga tayanadigan
   * bloklar uchun (masalan `AppShell` — telefon rejimi brauzer oynasi kengligiga bog'liq).
   */
  resizable?: boolean;
  lang: Lang;
}

export const blockCliCommand = (name: string) => `npx @akhatmirzo/cli add ${name}`;

/**
 * Blok: jonli ko'rinish (desktop / planshet / telefon kengligi) + manba kodi + CLI buyrug'i.
 * Kod build vaqtida blok faylidan olinadi (scripts/generate-demos.mjs), MDX'da takrorlanmaydi.
 */
export async function BlockPreview({ name, height, resizable = true, lang }: BlockPreviewProps) {
  const t = getDictionary(lang);
  const block = blocks[name];

  if (!block) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`BlockPreview: "${name}" bloki topilmadi (blocks/${name}/${name}.tsx)`);
    }
    return (
      <p className="not-prose rounded-xl border border-danger bg-danger-soft p-4 text-sm text-danger-soft-foreground">
        {t.preview.notFound}:{' '}
        <code>
          blocks/{name}/{name}.tsx
        </code>
      </p>
    );
  }

  const Block = block.component;

  return (
    <BlockFrame
      title={block.meta.title[lang]}
      command={blockCliCommand(name)}
      height={height}
      resizable={resizable}
      labels={{ ...t.blocks, preview: t.preview.preview, code: t.preview.code }}
      preview={<Block />}
      code={<ServerCodeBlock code={block.source} lang="tsx" codeblock={{ title: `${name}.tsx` }} />}
    />
  );
}
