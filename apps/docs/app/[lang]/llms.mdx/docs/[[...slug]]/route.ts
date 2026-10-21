import { notFound } from 'next/navigation';
import { toLang } from '@/lib/i18n';
import { getPageMarkdownUrl } from '@/lib/shared';
import { docsLlms, source } from '@/lib/source';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/[lang]/llms.mdx/docs/[[...slug]]'>,
) {
  const { slug, lang } = await params;
  const page = source.getPage(slug?.slice(0, -1), toLang(lang));
  if (!page) notFound();

  return new Response(await docsLlms.page(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageMarkdownUrl(page).segments,
  }));
}
