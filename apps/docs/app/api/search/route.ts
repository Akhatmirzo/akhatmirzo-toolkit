import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

/**
 * Qidiruv indeksi. Har bir sahifaga versiya tegi (`v0.1`, `v0.2` ...) qo'shiladi — qidiruv
 * oynasi faqat joriy versiya sahifalarini ko'rsatadi (components/search-dialog.tsx).
 */
export const { GET } = createFromSource(source, {
  buildIndex: (page) => ({
    id: page.url,
    url: page.url,
    title: page.data.title ?? page.slugs.at(-1) ?? page.url,
    description: page.data.description,
    structuredData: page.data.structuredData,
    tag: page.slugs[0],
  }),
});
