'use client';

import { IconButton, Tooltip } from '@akhatmirzo/ui';
import { ArrowLeft, Code2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { examples, examplesSourceUrl } from '@/lib/examples';
import { toLang } from '@/lib/i18n';

const subscribe = () => () => {};

/**
 * Har bir namuna ilovasining eng tepasidagi ingichka panel: namunalar ro'yxatiga qaytish,
 * namuna nomi, GitHub'dagi manba kodi va light/dark almashtirgich (saytning o'zi bilan sinxron).
 */
export function ExampleBar({ slug }: { slug: string }) {
  const lang = toLang(String(useParams().lang ?? 'uz'));
  const ex = examples.find((e) => e.slug === slug);
  const { resolvedTheme, setTheme } = useTheme();
  // Server render'da mavzu noma'lum — ikonka faqat mijozda chiziladi
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const dark = mounted && resolvedTheme === 'dark';
  const t =
    lang === 'uz'
      ? { back: 'Namunalar', source: 'Manba kodi', theme: 'Mavzuni almashtirish' }
      : { back: 'Examples', source: 'Source code', theme: 'Toggle theme' };

  return (
    <div className="sticky top-0 z-40 flex h-11 shrink-0 items-center gap-3 border-b border-border bg-surface/90 px-3 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <Link
        href={`/${lang}/examples`}
        className="focus-ring inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-medium text-text-muted transition-colors duration-fast hover:text-text"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t.back}
      </Link>
      <span aria-hidden="true" className="h-4 w-px bg-border" />
      <span className="truncate text-sm font-semibold">{ex?.title[lang]}</span>
      <div className="ml-auto flex items-center gap-1">
        <Tooltip content={t.source}>
          <IconButton asChild size="sm" variant="ghost" aria-label={t.source}>
            <a href={`${examplesSourceUrl}/${slug}`} target="_blank" rel="noreferrer">
              <Code2 aria-hidden="true" />
            </a>
          </IconButton>
        </Tooltip>
        <Tooltip content={t.theme}>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label={t.theme}
            onClick={() => setTheme(dark ? 'light' : 'dark')}
          >
            {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
