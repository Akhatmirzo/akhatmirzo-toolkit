import Link from 'next/link';
import type { ReactNode } from 'react';
import { ExampleBar } from '@/components/examples/shared/example-bar';
import { BrandPanel } from './brand-panel';
import { Logo } from './logo';
import { ResetDemoButton } from './reset-demo';

/**
 * Ikki ustunli qobiq: chapda brend paneli (faqat katta ekranda), o'ngda forma.
 * Telefonda bitta ustun — logotip forma tepasida.
 */
export function AuthShell({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <>
      <ExampleBar slug="auth" />
      <div className="grid flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <BrandPanel />
        <div className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between gap-4 px-4 pt-5 sm:px-8">
            <Link
              href={`/${lang}/examples/auth/sign-in`}
              aria-label="Kalit — bosh sahifa"
              className="focus-ring rounded-lg lg:invisible"
            >
              <Logo />
            </Link>
            <a
              href="#yordam"
              className="focus-ring rounded-md text-sm font-medium text-text-muted transition-colors duration-fast hover:text-text"
            >
              Yordam kerakmi?
            </a>
          </header>
          <main className="flex flex-1 justify-center px-4 py-8 sm:items-center sm:px-8 sm:py-12">
            <div className="w-full max-w-[26rem]">{children}</div>
          </main>
          <footer
            id="yordam"
            className="flex flex-col items-center gap-3 border-t border-border px-4 py-5 text-xs text-text-muted sm:flex-row sm:justify-between sm:px-8"
          >
            <p>
              Qo&apos;llab-quvvatlash:{' '}
              <span className="font-medium text-text">+998 71 200 00 00</span> · 24/7
            </p>
            <ResetDemoButton />
          </footer>
        </div>
      </div>
    </>
  );
}
