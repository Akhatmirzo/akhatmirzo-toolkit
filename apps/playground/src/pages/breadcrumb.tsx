import { Breadcrumb, type BreadcrumbItem } from '@akhatmirzo/ui';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Breadcrumb', group: 'Navigatsiya', order: 4 };

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

const items: BreadcrumbItem[] = [
  { label: 'Bosh sahifa', href: '#/breadcrumb', icon: <HomeIcon /> },
  { label: 'Katalog', href: '#/breadcrumb' },
  { label: 'Elektronika', href: '#/breadcrumb' },
  { label: 'Telefonlar', href: '#/breadcrumb' },
  { label: 'Apple', href: '#/breadcrumb' },
  { label: 'iPhone 17 Pro Max 256 GB, kosmik qora' },
];

export default function Page() {
  return (
    <DemoPage
      title="Breadcrumb"
      description="Sahifa yo‘li. maxItems oshsa — birinchi + … + oxirgilari, yashiringanlar DropdownMenu’da. 640px dan tor ekranda avtomatik: … + ota + joriy."
    >
      <DemoSection title="Asosiy">
        <Breadcrumb items={[items[0]!, items[1]!, items[3]!, items[5]!]} />
      </DemoSection>

      <DemoSection title="Yig‘ish" description={<Code>maxItems=4</Code>}>
        <Breadcrumb items={items} maxItems={4} />
      </DemoSection>

      <DemoSection title="Separator va o‘lcham">
        <DemoRow label='separator="/"'>
          <Breadcrumb items={items.slice(0, 4)} separator="/" />
        </DemoRow>
        <DemoRow label="sm">
          <Breadcrumb items={items.slice(0, 4)} size="sm" />
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Tor konteyner"
        description="Uzun nomlar qisqartiriladi (20ch / joriy 32ch)"
      >
        <div className="max-w-xs">
          <Breadcrumb items={items} maxItems={3} />
        </div>
      </DemoSection>
    </DemoPage>
  );
}
