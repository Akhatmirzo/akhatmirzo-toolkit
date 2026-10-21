import { Code, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Umumiy', group: 'Asoslar', order: 0 };

const packages = [
  {
    name: '@akhatmirzo/tokens',
    text: "Dizayn tokenlari: CSS o'zgaruvchilari va Tailwind v4 @theme",
  },
  { name: '@akhatmirzo/ui', text: 'React komponentlar (Tailwind v4 + Radix)' },
  { name: '@akhatmirzo/hooks', text: 'Qayta ishlatiladigan React hooklar' },
  { name: '@akhatmirzo/core', text: 'Toza TypeScript funksiyalar: formatlash, validatsiya, matn' },
];

export default function Page() {
  return (
    <DemoPage
      title="@akhatmirzo/ui"
      description="Shaxsiy React kutubxonasi: yumshoq va do'stona dizayn, indigo aksent, light va dark mavzular. Bu playground — komponentlarni jonli sinash uchun."
    >
      <DemoSection title="Paketlar">
        <ul className="flex flex-col divide-y divide-border">
          {packages.map((p) => (
            <li
              key={p.name}
              className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
            >
              <code className="font-mono text-sm font-medium text-primary-soft-foreground sm:w-48 sm:shrink-0">
                {p.name}
              </code>
              <span className="text-sm text-text-muted">{p.text}</span>
            </li>
          ))}
        </ul>
      </DemoSection>

      <DemoSection
        title="Ilovada ulash"
        description="Tailwind'dan keyin tokenlar faylini import qiling."
      >
        <pre className="overflow-x-auto rounded-lg bg-surface-muted p-4 font-mono text-xs text-text">
          {`@import 'tailwindcss';
@import '@akhatmirzo/tokens/theme.css';
@source '../node_modules/@akhatmirzo/ui';`}
        </pre>
        <p className="text-sm text-text-muted">
          Dark mode: <Code>{'<html data-theme="dark">'}</Code>. Komponentlar faqat semantik
          tokenlarni ishlatadi — <Code>bg-surface</Code>, <Code>text-text-muted</Code>,{' '}
          <Code>bg-primary</Code>.
        </p>
      </DemoSection>
    </DemoPage>
  );
}
