'use client';

import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  TagsList,
  TagsListItem,
} from 'fumadocs-ui/components/dialog/search';
import type { SharedProps } from 'fumadocs-ui/contexts/search';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { fetchClient } from 'fumadocs-core/search/client/fetch';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { isVersion, latestVersion, versions } from '@/lib/versions';

/**
 * Fumadocs qidiruvi + versiya filtri: `/<til>/docs/<versiya>/...` sahifasida faqat o'sha versiya
 * natijalari chiqadi (bosh sahifada — eng so'nggi versiya). Bir nechta versiya bo'lsa, oyna
 * pastida versiyani almashtirish tugmalari paydo bo'ladi.
 *
 * Standart `DefaultSearchDialog` footer'ni `SearchDialogContent` dan TASHQARIDA (portal'siz)
 * chizadi — tugmalar sahifa tepasida chiqib qoladi. Shuning uchun oyna qismlardan yig'ilgan va
 * footer kontent ichida.
 */
export function VersionedSearchDialog(props: SharedProps) {
  const segment = usePathname().split('/')[3];
  const current = isVersion(segment) ? segment : latestVersion;
  const [tag, setTag] = useState(current);
  const [prevCurrent, setPrevCurrent] = useState(current);
  const { locale } = useI18n();

  // Boshqa versiya sahifasiga o'tilganda filtr ham o'tadi (render paytida, effektsiz)
  if (prevCurrent !== current) {
    setPrevCurrent(current);
    setTag(current);
  }

  const search = useDocsSearch({ client: fetchClient({ api: '/api/search', locale, tag }) });

  return (
    <SearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
        {versions.length > 1 && (
          <SearchDialogFooter>
            <TagsList tag={tag} onTagChange={(v) => setTag(v ?? current)}>
              {versions.map((version) => (
                <TagsListItem key={version} value={version}>
                  {version}
                </TagsListItem>
              ))}
            </TagsList>
          </SearchDialogFooter>
        )}
      </SearchDialogContent>
    </SearchDialog>
  );
}
