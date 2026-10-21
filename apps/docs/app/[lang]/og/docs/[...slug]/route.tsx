import { generateOGImage } from 'fumadocs-ui/og';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/dictionary';
import { toLang } from '@/lib/i18n';
import { appName, getPageImageUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/[lang]/og/docs/[...slug]'>) {
  const { slug, lang: rawLang } = await params;
  const lang = toLang(rawLang);
  const page = source.getPage(slug.slice(0, -1), lang);
  if (!page) notFound();

  return generateOGImage({
    title: page.data.title,
    description: page.data.description,
    site: `${appName} · ${getDictionary(lang).nav.docs}`,
    // OG rasm — demo emas, bu yerda token ishlamaydi: indigo-600
    primaryColor: 'rgba(79, 70, 229, 0.45)',
    primaryTextColor: 'rgb(165, 180, 252)',
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImageUrl(page).segments,
  }));
}
