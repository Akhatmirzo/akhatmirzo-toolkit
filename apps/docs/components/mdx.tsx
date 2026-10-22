import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { i18n, type Lang } from '@/lib/i18n';
import { BlockGallery } from './blocks/block-gallery';
import { BlockInstall, type BlockInstallProps } from './blocks/block-install';
import { BlockPreview, type BlockPreviewProps } from './blocks/block-preview';
import { Install, type InstallProps } from './install';
import { ComponentPreview, type ComponentPreviewProps } from './preview/component-preview';
import { PropsTable, type PropsTableProps } from './props-table';

/**
 * MDX'da ishlatiladigan komponentlar. Tilga bog'liq komponentlar (sarlavha va tab nomlari)
 * sahifa tilini shu yerda oladi — MDX'da `lang` yozilmaydi.
 */
export function getMDXComponents(lang: Lang = i18n.defaultLanguage, components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tabs,
    Tab,
    Steps,
    Step,
    Accordion,
    Accordions,
    TypeTable,
    Install: (props: InstallProps) => <Install {...props} />,
    ComponentPreview: (props: Omit<ComponentPreviewProps, 'lang'>) => (
      <ComponentPreview {...props} lang={lang} />
    ),
    PropsTable: (props: Omit<PropsTableProps, 'lang'>) => <PropsTable {...props} lang={lang} />,
    BlockPreview: (props: Omit<BlockPreviewProps, 'lang'>) => (
      <BlockPreview {...props} lang={lang} />
    ),
    BlockInstall: (props: BlockInstallProps) => <BlockInstall {...props} />,
    BlockGallery: () => <BlockGallery lang={lang} />,
    ...components,
  } satisfies MDXComponents;
}

export function useMDXComponents(components?: MDXComponents) {
  return getMDXComponents(i18n.defaultLanguage, components);
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
