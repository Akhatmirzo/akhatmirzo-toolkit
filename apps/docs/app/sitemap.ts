import type { MetadataRoute } from 'next';
import { i18n } from '@/lib/i18n';
import { siteUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const home = i18n.languages.map((lang) => ({
    url: `${siteUrl}/${lang}`,
    changeFrequency: 'weekly' as const,
    priority: 1,
  }));
  const docs = source.getPages().map((page) => ({
    url: `${siteUrl}${page.url}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  return [...home, ...docs];
}
