import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

/**
 * 1) `/uz/docs/....md` yoki `Accept: text/markdown` — sahifaning Markdown ko'rinishiga rewrite.
 * 2) Qolgan hammasi — i18n: tilsiz URL (`/`, `/docs/...`) brauzer tiliga (yoki `uz` ga) yo'naltiriladi.
 */
const { rewrite: rewriteDocs } = rewritePath(
  '/:lang/docs{/*path}',
  '/:lang/llms.mdx/docs{/*path}/content.md',
);
const { rewrite: rewriteSuffix } = rewritePath(
  '/:lang/docs{/*path}.md',
  '/:lang/llms.mdx/docs{/*path}/content.md',
);

const i18nProxy = createI18nMiddleware(i18n);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  const suffix = rewriteSuffix(pathname);
  if (suffix) {
    return NextResponse.rewrite(new URL(suffix, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(pathname);
    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl), {
        // Bu URL ikki ko'rinishga ega — `Accept` sarlavhasiga qarab tanlanadi
        headers: { Vary: 'Accept' },
      });
    }
  }

  return i18nProxy(request, event);
}

export const config = {
  // API, Next ichki fayllari, fayllar (rasm, txt, xml) va llms.txt — tilsiz qoladi
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|llms\\.txt|llms-full\\.txt|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|svg|ico|webp|txt|xml|json)$).*)',
  ],
};
