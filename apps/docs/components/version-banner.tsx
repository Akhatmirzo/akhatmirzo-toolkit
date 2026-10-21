import Link from 'next/link';
import { getDictionary } from '@/lib/dictionary';
import type { Lang } from '@/lib/i18n';
import { source } from '@/lib/source';
import { isLatestVersion, latestVersion, versionLandingSlug } from '@/lib/versions';

/** Eski versiya sahifasida: shu sahifaning eng so'nggi versiyadagi nusxasiga (yoki kirishga) havola */
export function VersionBanner({ lang, slugs }: { lang: Lang; slugs: string[] }) {
  const [version, ...rest] = slugs;
  if (!version || isLatestVersion(version)) return null;

  const t = getDictionary(lang);
  const target =
    source.getPage([latestVersion, ...rest], lang) ??
    source.getPage([latestVersion, versionLandingSlug], lang);

  return (
    <div
      role="note"
      className="not-prose flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning-soft p-4 text-warning-soft-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="text-sm">
        <p className="font-semibold">{t.version.outdatedTitle}</p>
        <p className="opacity-90">{t.version.outdatedText(version, latestVersion)}</p>
      </div>
      {target && (
        <Link
          href={target.url}
          className="focus-ring inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-warning px-3 text-sm font-medium text-warning-foreground"
        >
          {t.version.goLatest} →
        </Link>
      )}
    </div>
  );
}
