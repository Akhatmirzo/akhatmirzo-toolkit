import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/shared';

export default function robots(): MetadataRoute.Robots {
  return {
    // `/api/` — qidiruv endpoint'i, indekslash uchun emas
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
