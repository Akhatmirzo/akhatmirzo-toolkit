import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { VersionBanner } from '@/components/version-banner';
import { getDictionary } from '@/lib/dictionary';
import { i18n, toLang, type Lang } from '@/lib/i18n';
import { docsLastModified } from '@/lib/last-modified';
import { appName, getEditUrl, getPageImageUrl, getPageMarkdownUrl } from '@/lib/shared';
import { absoluteUrl, JsonLd, pageMetadata, personLd, softwareId, websiteId } from '@/lib/seo';
import { source, type DocsPage as DocsPageData } from '@/lib/source';
import { isLatestVersion, isVersion, latestVersion, versionLandingSlug } from '@/lib/versions';

/**
 * Versiyalar bo'yicha kanonik siyosat:
 * - eng so'nggi versiya sahifasi — o'ziga kanonik, sitemap'da;
 * - eski versiya sahifasi, so'nggi versiyada nusxasi bo'lsa — kanonik o'sha nusxaga (qidiruv
 *   natijalarida doim eng yangi hujjat chiqadi, eski URL ishlayveradi);
 * - eski versiya sahifasi, nusxasi yo'q (olib tashlangan API) — `noindex, follow`, sitemap'da yo'q.
 */
function canonicalPage(page: DocsPageData, lang: Lang): DocsPageData | undefined {
  const [version, ...rest] = page.slugs;
  if (!version || isLatestVersion(version)) return page;
  return source.getPage([latestVersion, ...rest], lang);
}

/**
 * `<title>` uchun kontekst: "Button" yoki "Matn" o'zi qidiruvda kuchsiz — bo'lim qo'shiladi.
 * Sahifadagi H1 o'zgarmaydi (frontmatter `title`).
 */
function seoTitle(page: DocsPageData, lang: Lang): string {
  const [, section] = page.slugs;
  const { title } = page.data;
  if (section === 'components' && page.slugs.length > 2) {
    return `${title} — ${lang === 'uz' ? 'React komponenti' : 'React component'}`;
  }
  if (section === 'core' && page.slugs.length > 2) return `${title} — @akhatmirzo/core`;
  if (section === 'hooks') return `${title} — @akhatmirzo/hooks`;
  return title;
}

function docsJsonLd(page: DocsPageData, lang: Lang, canonicalUrl: string) {
  const t = getDictionary(lang);
  const [version = latestVersion] = page.slugs;
  const landingUrl = `/${lang}/docs/${version}/${versionLandingSlug}`;
  const crumbs = [
    { name: appName, url: `/${lang}` },
    { name: `${t.nav.docs} ${version}`, url: landingUrl },
    ...(page.url === landingUrl ? [] : [{ name: page.data.title, url: page.url }]),
  ];
  const modified = docsLastModified(page.path);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${absoluteUrl(page.url)}#article`,
        headline: page.data.title,
        description: page.data.description,
        url: absoluteUrl(canonicalUrl),
        mainEntityOfPage: absoluteUrl(canonicalUrl),
        inLanguage: lang,
        image: absoluteUrl(getPageImageUrl(page).url),
        ...(modified ? { dateModified: modified } : {}),
        author: personLd,
        publisher: personLd,
        isPartOf: { '@id': websiteId },
        about: { '@id': softwareId },
        version,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: absoluteUrl(c.url),
        })),
      },
    ],
  };
}

export default async function Page(props: PageProps<'/[lang]/docs/[[...slug]]'>) {
  const params = await props.params;
  const lang = toLang(params.lang);
  const slug = params.slug ?? [];

  // /uz/docs → eng so'nggi versiya; /uz/docs/v0.1 → shu versiyaning kirish sahifasi
  if (slug.length === 0) redirect(`/${lang}/docs/${latestVersion}/${versionLandingSlug}`);
  if (slug.length === 1 && isVersion(slug[0])) {
    redirect(`/${lang}/docs/${slug[0]}/${versionLandingSlug}`);
  }

  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <JsonLd data={docsJsonLd(page, lang, (canonicalPage(page, lang) ?? page).url)} />
      <VersionBanner lang={lang} slugs={page.slugs} />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={getEditUrl(page.path)} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents(lang, {
            // MDX ichida nisbiy fayl yo'llari bilan havola qilish mumkin: [Button](./button.mdx)
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/[lang]/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const lang = toLang(params.lang);
  const page = source.getPage(params.slug, lang);
  if (!page) return {};

  const canonical = canonicalPage(page, lang);
  const target = canonical ?? page;
  const languages = Object.fromEntries(
    i18n.languages.flatMap((l) => {
      const alt = source.getPage(target.slugs, l);
      return alt ? [[l, alt.url]] : [];
    }),
  );

  return pageMetadata({
    lang,
    title: seoTitle(page, lang),
    description: page.data.description ?? getDictionary(lang).meta.description,
    canonical: target.url,
    languages,
    image: getPageImageUrl(page).url,
    type: 'article',
    modifiedTime: docsLastModified(page.path),
    noindex: !canonical,
  });
}
