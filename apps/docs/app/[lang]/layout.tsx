import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '../global.css';
import { LibraryProviders } from '@/components/providers';
import { VersionedSearchDialog } from '@/components/search-dialog';
import { getDictionary } from '@/lib/dictionary';
import { i18n, isLang } from '@/lib/i18n';
import { appName, siteUrl } from '@/lib/shared';
import { uiText } from '@/lib/translations';

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export async function generateMetadata(props: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLang(lang)) return {};
  const t = getDictionary(lang);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.title, template: `%s — ${appName}` },
    description: t.meta.description,
    applicationName: appName,
    alternates: {
      languages: Object.fromEntries(i18n.languages.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      siteName: appName,
      locale: lang === 'uz' ? 'uz_UZ' : 'en_US',
      type: 'website',
    },
  };
}

export default async function Layout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider
          i18n={i18nProvider(uiText, lang)}
          // Fumadocs `.dark` klassi + kutubxonaning `data-theme="dark"` — bir vaqtda
          theme={{ attribute: ['class', 'data-theme'] }}
          search={{ SearchDialog: VersionedSearchDialog }}
        >
          <LibraryProviders>{children}</LibraryProviders>
        </RootProvider>
      </body>
    </html>
  );
}
