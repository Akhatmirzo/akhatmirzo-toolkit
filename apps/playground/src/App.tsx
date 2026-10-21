import { cn } from '@akhatmirzo/ui';
import { useEffect } from 'react';
import { groupedPages, pages } from './pages';
import { hrefFor, useSlug } from './router';
import { type Theme, useTheme } from './theme';

const groups = groupedPages();

export function App() {
  const slug = useSlug();
  const page = pages.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = page ? `${page.title} — @akhatmirzo/ui` : 'Playground — @akhatmirzo/ui';
  }, [page]);

  return (
    <div className="min-h-dvh bg-background font-sans text-text antialiased">
      <Header />
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        <nav
          aria-label="Sahifalar"
          className="shrink-0 border-b border-border px-4 py-4 md:sticky md:top-14 md:h-[calc(100dvh-3.5rem)] md:w-60 md:overflow-y-auto md:border-r md:border-b-0 md:py-6"
        >
          <div className="flex flex-col gap-4 md:gap-6">
            {groups.map((group) => (
              <div key={group.name}>
                <p className="px-2 text-xs font-semibold text-text-faint uppercase">{group.name}</p>
                <ul className="mt-1.5 flex flex-wrap gap-1 md:flex-col md:gap-0.5">
                  {group.pages.map((p) => {
                    const active = p.slug === page?.slug;
                    return (
                      <li key={p.slug}>
                        <a
                          href={hrefFor(p.slug)}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'focus-ring block rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-fast',
                            active
                              ? 'bg-primary-soft text-primary-soft-foreground'
                              : 'text-text-muted hover:bg-surface-muted hover:text-text',
                          )}
                        >
                          {p.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>
        <main className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">
          {page ? <page.Component /> : <NotFound slug={slug} />}
        </main>
      </div>
    </div>
  );
}

function Header() {
  const [theme, setTheme] = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-border bg-surface px-4">
      <a href={hrefFor('overview')} className="focus-ring rounded-md text-sm font-semibold">
        @akhatmirzo<span className="text-text-muted">/ui</span>
      </a>
      <div
        role="group"
        aria-label="Mavzu"
        className="flex rounded-lg border border-border bg-surface-muted p-0.5"
      >
        {(['light', 'dark'] as Theme[]).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={theme === t}
            onClick={() => setTheme(t)}
            className={cn(
              'focus-ring h-7 cursor-pointer rounded-md border-0 px-3 font-sans text-xs font-medium transition-colors duration-fast',
              theme === t
                ? 'bg-surface text-text shadow-xs'
                : 'bg-transparent text-text-muted hover:text-text',
            )}
          >
            {t === 'light' ? 'Light' : 'Dark'}
          </button>
        ))}
      </div>
    </header>
  );
}

function NotFound({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <h1 className="text-2xl font-semibold">Sahifa topilmadi</h1>
      <p className="text-sm text-text-muted">
        <code className="font-mono">#/{slug}</code> mavjud emas.{' '}
        <a href={hrefFor('overview')} className="focus-ring rounded-sm text-primary underline">
          Bosh sahifaga qaytish
        </a>
      </p>
    </div>
  );
}
