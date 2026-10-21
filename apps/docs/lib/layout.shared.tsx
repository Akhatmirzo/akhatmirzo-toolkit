import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { getDictionary } from './dictionary';
import type { Lang } from './i18n';
import { appName, githubUrl } from './shared';
import { latestVersion, versionLandingSlug } from './versions';

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 font-semibold">
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-6">
        <rect width="32" height="32" rx="9" className="fill-primary" />
        <path
          d="M10 22 16 9l6 13M12.5 17h7"
          fill="none"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-primary-foreground"
        />
      </svg>
      <span>{appName}</span>
    </span>
  );
}

export function docsHome(lang: Lang) {
  return `/${lang}/docs/${latestVersion}/${versionLandingSlug}`;
}

export function baseOptions(lang: Lang): BaseLayoutProps {
  const t = getDictionary(lang);
  return {
    nav: {
      title: <Logo />,
      url: `/${lang}`,
    },
    githubUrl,
    links: [
      {
        text: t.nav.docs,
        url: docsHome(lang),
        active: 'none',
      },
    ],
  };
}
