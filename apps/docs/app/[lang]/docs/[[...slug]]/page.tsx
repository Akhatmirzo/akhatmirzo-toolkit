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
import { toLang } from '@/lib/i18n';
import { getEditUrl, getPageImageUrl, getPageMarkdownUrl } from '@/lib/shared';
import { source } from '@/lib/source';
import { isVersion, latestVersion, versionLandingSlug } from '@/lib/versions';

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

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
