import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { demos } from '@/components/demos/registry.generated';
import { getDictionary } from '@/lib/dictionary';
import type { Lang } from '@/lib/i18n';
import { PreviewTabs } from './preview-tabs';

export interface ComponentPreviewProps {
  /** Demo nomi = `components/demos/` ga nisbatan yo'l, `.tsx` siz: `"button/variants"` */
  name: string;
  /** Demoni markazda (default) yoki chap-yuqorida joylash */
  align?: 'center' | 'start';
  lang: Lang;
}

/**
 * Demo komponenti + uning haqiqiy manba kodi. Kod build vaqtida demo faylidan olinadi
 * (scripts/generate-demos.mjs), MDX'da takrorlanmaydi.
 */
export async function ComponentPreview({ name, align = 'center', lang }: ComponentPreviewProps) {
  const t = getDictionary(lang).preview;
  const demo = demos[name];

  if (!demo) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `ComponentPreview: "${name}" demosi topilmadi (components/demos/${name}.tsx)`,
      );
    }
    return (
      <p className="not-prose rounded-xl border border-danger bg-danger-soft p-4 text-sm text-danger-soft-foreground">
        {t.notFound}: <code>components/demos/{name}.tsx</code>
      </p>
    );
  }

  const Demo = demo.component;

  return (
    <PreviewTabs
      labels={{ preview: t.preview, code: t.code }}
      align={align}
      preview={<Demo />}
      code={
        <ServerCodeBlock
          code={demo.source}
          lang="tsx"
          codeblock={{ title: `${name.split('/').pop()}.tsx` }}
        />
      }
    />
  );
}
