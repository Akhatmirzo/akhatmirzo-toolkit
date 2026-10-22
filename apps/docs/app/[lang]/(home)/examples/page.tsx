import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { exampleHref, examples, examplesSourceUrl } from '@/lib/examples';
import { toLang, type Lang } from '@/lib/i18n';

const text = {
  uz: {
    title: 'Namunalar',
    lead: "Kutubxona komponentlaridan yig'ilgan to'liq ishlaydigan ilovalar. Ma'lumotlar statik, lekin hamma narsa ishlaydi: qidiruv, filtrlar, formalar, dialoglar, grafiklar. Kodini o'zingizning loyihangizga ko'chirib oling.",
    open: 'Ochish',
    source: "GitHub'da manba kodi",
    uses: 'Ishlatilgan',
  },
  en: {
    title: 'Examples',
    lead: 'Fully working apps built from the library components. The data is static, but everything works: search, filters, forms, dialogs, charts. Copy the code into your own project.',
    open: 'Open',
    source: 'Source on GitHub',
    uses: 'Uses',
  },
} satisfies Record<Lang, Record<string, string>>;

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/examples'>): Promise<Metadata> {
  const t = text[toLang((await params).lang)];
  return { title: t.title, description: t.lead };
}

export default async function ExamplesPage({ params }: PageProps<'/[lang]/examples'>) {
  const lang = toLang((await params).lang);
  const t = text[lang];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 font-sans text-text md:py-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t.title}</h1>
        <p className="mt-3 text-base text-text-muted">{t.lead}</p>
        <a
          href={examplesSourceUrl}
          className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-link hover:underline"
        >
          {t.source}
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </header>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map((ex) => (
          <li key={ex.slug}>
            <Link
              href={exampleHref(lang, ex)}
              className="focus-ring group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-xs transition-[box-shadow,border-color] duration-base hover:border-border-strong hover:shadow-md"
            >
              <h2 className="text-lg font-semibold">{ex.title[lang]}</h2>
              <p className="mt-1.5 flex-1 text-sm text-text-muted">{ex.description[lang]}</p>
              <p className="mt-4 text-xs font-medium text-text-faint">{t.uses}</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {ex.components.map((c) => (
                  <li
                    key={c}
                    className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary-soft-foreground"
                  >
                    {c}
                  </li>
                ))}
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-link">
                {t.open}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-base group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
