import type { MetadataRoute } from 'next';
import { examplePageKeys, exampleSourceDirs, isExamplePageIndexed } from '@/lib/example-pages';
import { i18n } from '@/lib/i18n';
import { docsLastModified, lastModified } from '@/lib/last-modified';
import { languageAlternates, withDefault } from '@/lib/seo';
import { siteUrl } from '@/lib/shared';
import { source } from '@/lib/source';
import { isLatestVersion } from '@/lib/versions';

export const revalidate = false;

type Entry = MetadataRoute.Sitemap[number];

const abs = (path: string) => `${siteUrl}${path}`;

function absAlternates(languages: Record<string, string>) {
  return { languages: Object.fromEntries(Object.entries(languages).map(([l, p]) => [l, abs(p)])) };
}

/** Bir sahifaning barcha til nusxalari — har biri alohida `<url>`, hammasida bir xil hreflang */
function localized(
  path: string,
  extra: Pick<Entry, 'lastModified' | 'changeFrequency' | 'priority'>,
): Entry[] {
  const alternates = absAlternates(languageAlternates(path));
  return i18n.languages.map((lang) => ({ url: abs(`/${lang}${path}`), alternates, ...extra }));
}

/**
 * Faqat yakuniy (200) URL'lar: tilli manzillar (`/uz/...`), redirect qiluvchi `/`, `/uz/docs`,
 * `/uz/docs/v0.1` va `/uz/examples/auth` yo'q. Eski versiya sahifalari ham yo'q — ular kanonik
 * bo'yicha eng so'nggi versiyaga ishora qiladi yoki `noindex` (qarang: docs `page.tsx`).
 * `noindex` namuna sahifalari (checkout) ham kiritilmaydi.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const home = localized('', {
    lastModified: lastModified('app/[lang]/(home)', 'lib/dictionary.ts', 'components/home'),
    changeFrequency: 'weekly',
    priority: 1,
  });

  const examplesIndex = localized('/examples', {
    lastModified: lastModified('app/[lang]/(home)/examples', 'lib/examples.ts'),
    changeFrequency: 'monthly',
    priority: 0.6,
  });

  const examplePages = examplePageKeys.filter(isExamplePageIndexed).flatMap((key) =>
    localized(`/examples/${key}`, {
      lastModified: lastModified(...exampleSourceDirs(key)),
      changeFrequency: 'monthly',
      // Namunaning bosh sahifasi biroz muhimroq
      priority: !key.includes('/') || key === 'auth/sign-in' ? 0.5 : 0.4,
    }),
  );

  const docs = source
    .getPages()
    .filter((page) => isLatestVersion(page.slugs[0] ?? ''))
    .map((page): Entry => {
      const languages = withDefault(
        Object.fromEntries(
          i18n.languages.flatMap((l) => {
            const alt = source.getPage(page.slugs, l);
            return alt ? [[l, alt.url]] : [];
          }),
        ),
      );
      return {
        url: abs(page.url),
        lastModified: docsLastModified(page.path),
        changeFrequency: 'weekly',
        priority: page.slugs.length <= 2 ? 0.8 : 0.7,
        alternates: absAlternates(languages),
      };
    });

  return [...home, ...examplesIndex, ...examplePages, ...docs];
}
