import type { ComponentType } from 'react';

export interface PageMeta {
  title: string;
  group: string;
  order: number;
}

interface PageModule {
  meta: PageMeta;
  default: ComponentType;
}

export interface PageEntry extends PageMeta {
  slug: string;
  Component: ComponentType;
}

export const GROUPS = ['Asoslar', 'Tokenlar', 'Formalar', 'Tanlov', "Ko'rsatish"];

export const DEFAULT_SLUG = 'overview';

const modules = import.meta.glob<PageModule>('./pages/*.tsx', { eager: true });

function groupIndex(group: string) {
  const i = GROUPS.indexOf(group);
  return i === -1 ? GROUPS.length : i;
}

export const pages: PageEntry[] = Object.entries(modules)
  .map(([path, mod]) => ({
    ...mod.meta,
    slug: path.replace('./pages/', '').replace(/\.tsx$/, ''),
    Component: mod.default,
  }))
  .sort(
    (a, b) =>
      groupIndex(a.group) - groupIndex(b.group) ||
      a.group.localeCompare(b.group) ||
      a.order - b.order ||
      a.title.localeCompare(b.title),
  );

export function groupedPages() {
  const groups: { name: string; pages: PageEntry[] }[] = [];
  for (const page of pages) {
    const last = groups.at(-1);
    if (last?.name === page.group) last.pages.push(page);
    else groups.push({ name: page.group, pages: [page] });
  }
  return groups;
}
