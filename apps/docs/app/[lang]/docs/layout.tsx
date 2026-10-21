import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getDictionary } from '@/lib/dictionary';
import { toLang } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { isLatestVersion } from '@/lib/versions';

export default async function Layout({ params, children }: LayoutProps<'/[lang]/docs'>) {
  const lang = toLang((await params).lang);
  const t = getDictionary(lang);

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      {...baseOptions(lang)}
      // Har bir versiya papkasi (meta.json: root: true) — sidebar'dagi versiya tanlagich
      tabs={{
        transform: (tab, node) => {
          const version = typeof node.name === 'string' ? node.name : '';
          return {
            ...tab,
            description: isLatestVersion(version) ? t.version.latest : tab.description,
          };
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
