import type { Metadata } from 'next';
import { i18n, type Lang } from './i18n';
import { appName, githubUrl, npmUrl, siteUrl } from './shared';

/**
 * SEO yordamchilari: kanonik + hreflang havolalar, Open Graph / Twitter kartalari va JSON-LD.
 * Har bir sahifa `pageMetadata()` ni chaqiradi — Next metama'lumotni sayoz (shallow) birlashtiradi,
 * shuning uchun `openGraph`/`alternates` ni sahifa darajasida to'liq berish kerak.
 */

export const author = {
  name: 'Akhatmirzo Umarov',
  url: 'https://akhatmirzo.uz',
  github: 'https://github.com/Akhatmirzo',
} as const;

export const ogLocales: Record<Lang, string> = { uz: 'uz_UZ', en: 'en_US' };

/** `/${lang}${path}` — `path` bo'sh (bosh sahifa) yoki `/` bilan boshlanadi */
export function localePath(lang: Lang, path: string) {
  return `/${lang}${path}`;
}

/** Barcha tillar uchun bir xil yo'l: `{ uz: '/uz/...', en: '/en/...', 'x-default': '/uz/...' }` */
export function languageAlternates(path: string): Record<string, string> {
  return withDefault(Object.fromEntries(i18n.languages.map((l) => [l, localePath(l, path)])));
}

/** `x-default` — asosiy til (`uz`) nusxasi: tilsiz `/` esa 307 redirect, u sitemap/hreflang'ga yaramaydi */
export function withDefault(languages: Record<string, string>): Record<string, string> {
  const fallback = languages[i18n.defaultLanguage];
  return fallback ? { ...languages, 'x-default': fallback } : languages;
}

/** Sayt standart OG rasmi (bosh sahifa, namunalar) — `app/[lang]/og/site/[...slug]` */
export function siteImageUrl(lang: Lang, segments: string[] = []) {
  return `/${lang}/og/site/${[...segments, 'image.png'].join('/')}`;
}

interface PageMetadataOptions {
  lang: Lang;
  /** Sahifa sarlavhasi (ildiz shablon ` · @akhatmirzo/ui` qo'shadi) */
  title: string;
  /** `true` — sarlavha shablonsiz (bosh sahifa) */
  absoluteTitle?: boolean;
  description: string;
  /** Kanonik URL (sayt ichidagi yo'l, tilli) */
  canonical: string;
  /** hreflang: til → yo'l (`x-default` ni `withDefault` qo'shadi) */
  languages: Record<string, string>;
  image: string;
  type?: 'website' | 'article';
  modifiedTime?: string;
  noindex?: boolean;
}

export function pageMetadata({
  lang,
  title,
  absoluteTitle,
  description,
  canonical,
  languages,
  image,
  type = 'website',
  modifiedTime,
  noindex,
}: PageMetadataOptions): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} · ${appName}`;
  const images = [{ url: image, width: 1200, height: 630, alt: fullTitle }];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical, languages: withDefault(languages) },
    openGraph: {
      type,
      siteName: appName,
      locale: ogLocales[lang],
      alternateLocale: i18n.languages.filter((l) => l !== lang).map((l) => ogLocales[l]),
      url: canonical,
      title: fullTitle,
      description,
      images,
      ...(type === 'article' && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

// ---------------------------------------------------------------- JSON-LD

export const personLd = {
  '@type': 'Person',
  '@id': `${author.url}/#person`,
  name: author.name,
  url: author.url,
  sameAs: [author.github],
} as const;

export const websiteId = `${siteUrl}/#website`;
export const softwareId = `${siteUrl}/#software`;

export function absoluteUrl(path: string) {
  return path.startsWith('http') ? path : `${siteUrl}${path}`;
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // `<` ni qochiramiz — matndagi `</script>` sahifani buzmasin (Next JSON-LD yo'riqnomasi)
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

export function homeJsonLd(lang: Lang, description: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: appName,
        url: absoluteUrl(`/${lang}`),
        description,
        inLanguage: i18n.languages,
        publisher: { '@id': personLd['@id'] },
      },
      {
        '@type': 'SoftwareSourceCode',
        '@id': softwareId,
        name: appName,
        description,
        url: siteUrl,
        codeRepository: githubUrl,
        programmingLanguage: { '@type': 'ComputerLanguage', name: 'TypeScript' },
        runtimePlatform: 'React',
        license: 'https://opensource.org/licenses/MIT',
        isAccessibleForFree: true,
        author: { '@id': personLd['@id'] },
        sameAs: [npmUrl, githubUrl],
      },
      personLd,
    ],
  };
}
