import { Accessibility, ArrowRight, Boxes, Languages, Layers, Leaf, Moon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CopyCommand } from '@/components/home/copy-command';
import { Gallery } from '@/components/home/gallery';
import { getDictionary } from '@/lib/dictionary';
import { toLang, type Lang } from '@/lib/i18n';
import { docsHome } from '@/lib/layout.shared';
import { githubUrl, npmUrl } from '@/lib/shared';
import { latestVersion } from '@/lib/versions';

const featureIcons = {
  languages: Languages,
  accessibility: Accessibility,
  moon: Moon,
  layers: Layers,
  boxes: Boxes,
  leaf: Leaf,
} as const;

/** `matn` ichidagi `kod` qismlarini <code> ga aylantiradi */
function richText(value: string): ReactNode[] {
  return value.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') ? (
      <code
        key={i}
        className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em] text-text"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

const btn =
  'focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors duration-base';

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const lang: Lang = toLang((await params).lang);
  const t = getDictionary(lang).home;
  const docs = (path: string) => `/${lang}/docs/${latestVersion}/${path}`;

  return (
    <div className="flex flex-1 flex-col font-sans text-text">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--ak-primary-soft),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--ak-border)_1px,transparent_1px),linear-gradient(90deg,var(--ak-border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] [background-size:48px_48px] opacity-60"
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
          <a
            href={npmUrl}
            className="focus-ring mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted shadow-xs transition-colors hover:text-text"
          >
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            {t.badge}
          </a>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-6xl sm:leading-[1.05]">
            {t.titleTop}{' '}
            <span className="bg-gradient-to-r from-primary to-[var(--ak-sky-500)] bg-clip-text text-transparent">
              {t.titleAccent}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-pretty text-text-muted sm:text-lg">
            {t.lead}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={docsHome(lang)}
              className={`${btn} bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover`}
            >
              {t.start}
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={githubUrl}
              className={`${btn} border border-border bg-surface text-text hover:border-border-strong`}
            >
              <GitHubIcon />
              GitHub
            </a>
          </div>
          <div className="mt-8 flex w-full justify-center">
            <CopyCommand
              command="pnpm add @akhatmirzo/ui @akhatmirzo/tokens"
              labels={{ copy: t.copy, copied: t.copied }}
            />
          </div>
        </div>
      </section>

      {/* Afzalliklar */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t.featuresTitle}</h2>
          <p className="mt-3 text-text-muted">{t.featuresLead}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.map((feature) => {
            const Icon = featureIcons[feature.icon as keyof typeof featureIcons];
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-surface p-6 shadow-xs transition-shadow duration-moderate hover:shadow-md"
              >
                <span className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{richText(feature.text)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Jonli galereya */}
      <section className="border-y border-border bg-surface-muted/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t.galleryTitle}</h2>
            <p className="mt-3 text-text-muted">{t.galleryLead}</p>
          </div>
          <Gallery lang={lang} />
        </div>
      </section>

      {/* Paketlar */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t.packagesTitle}</h2>
          <p className="mt-3 text-text-muted">{t.packagesLead}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {t.packages.map((pkg) => (
            <Link
              key={pkg.name}
              href={docs(pkg.href)}
              className="focus-ring group flex flex-col gap-2 rounded-2xl border border-border bg-surface p-6 shadow-xs transition-[border-color,box-shadow] duration-moderate hover:border-primary hover:shadow-md"
            >
              <span className="flex items-center justify-between font-mono text-sm font-semibold text-primary-soft-foreground">
                {pkg.name}
                <ArrowRight className="size-4 text-text-faint transition-transform duration-base group-hover:translate-x-0.5 group-hover:text-primary" />
              </span>
              <span className="text-sm text-text-muted">{pkg.text}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Chaqiruv */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.ctaTitle}</h2>
          <p className="max-w-xl opacity-90">{t.ctaText}</p>
          <Link
            href={docs('installation')}
            className={`${btn} bg-surface text-text hover:bg-surface-muted`}
          >
            {t.ctaButton}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-text-muted">
        {t.footer}
      </footer>
    </div>
  );
}
