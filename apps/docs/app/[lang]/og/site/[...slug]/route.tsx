import { generateOGImage } from 'fumadocs-ui/og';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/dictionary';
import { exampleOgText, exampleSlugs } from '@/lib/example-pages';
import { i18n, toLang, type Lang } from '@/lib/i18n';
import { appName } from '@/lib/shared';

export const revalidate = false;

/**
 * Docs'dan tashqari sahifalarning OG rasmi (docs sahifalariniki — `og/docs/[...slug]`):
 * - `/uz/og/site/image.png` — bosh sahifa (saytning standart rasmi)
 * - `/uz/og/site/examples/image.png` — namunalar ro'yxati
 * - `/uz/og/site/examples/<slug>/image.png` — har bir namuna
 */
function resolve(lang: Lang, segments: string[]) {
  const t = getDictionary(lang);
  if (segments.length === 0) {
    return {
      title: `${t.home.titleTop} ${t.home.titleAccent}`,
      // Faqat birinchi qism (":" gacha) — to'liq tavsif rasmga sig'maydi
      description: t.meta.description.split(':')[0],
      site: appName,
    };
  }
  if (segments[0] !== 'examples') return undefined;
  const site = `${appName} · ${t.nav.examples}`;
  if (segments.length === 1) {
    return {
      title: t.nav.examples,
      description:
        lang === 'uz'
          ? "Kutubxona komponentlaridan yig'ilgan to'liq ishlaydigan ilovalar."
          : 'Fully working apps built from the library components.',
      site: appName,
    };
  }
  const text = segments.length === 2 ? exampleOgText(segments[1] ?? '', lang) : undefined;
  return text ? { ...text, site } : undefined;
}

export async function GET(_req: Request, { params }: RouteContext<'/[lang]/og/site/[...slug]'>) {
  const { slug, lang: rawLang } = await params;
  if (slug.at(-1) !== 'image.png') notFound();
  const content = resolve(toLang(rawLang), slug.slice(0, -1));
  if (!content) notFound();

  return generateOGImage({
    ...content,
    // OG rasm — demo emas, bu yerda token ishlamaydi: indigo-600
    primaryColor: 'rgba(79, 70, 229, 0.45)',
    primaryTextColor: 'rgb(165, 180, 252)',
  });
}

export function generateStaticParams() {
  const paths = [[], ['examples'], ...exampleSlugs.map((s) => ['examples', s])];
  return i18n.languages.flatMap((lang) =>
    paths.map((segments) => ({ lang, slug: [...segments, 'image.png'] })),
  );
}
