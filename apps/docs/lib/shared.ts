import { createGetUrl } from 'fumadocs-core/source';
import { i18n } from './i18n';

export const appName = '@akhatmirzo/ui';
/**
 * Saytning to'liq manzili (sitemap, robots, OG, `metadataBase`).
 * Tartib: `NEXT_PUBLIC_SITE_URL` (o'z domeningiz) → Vercel production domeni → standart manzil.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://toolkit.akhatmirzo.uz')
).replace(/\/+$/, '');
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'Akhatmirzo',
  repo: 'akhatmirzo-toolkit',
  branch: 'main',
};

export const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
export const npmUrl = 'https://www.npmjs.com/package/@akhatmirzo/ui';

/** Kontent fayli repo ichida qayerda turadi (GitHub "tahrirlash" havolasi uchun) */
export const contentDir = 'apps/docs/content/docs';

export function getEditUrl(pagePath: string) {
  return `${githubUrl}/blob/${gitConfig.branch}/${contentDir}/${pagePath}`;
}

const getContentUrl = createGetUrl(docsContentRoute, i18n);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute, i18n);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
