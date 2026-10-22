import { Button, EmptyState } from '@akhatmirzo/ui';
import { Code, DemoGrid, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'EmptyState', group: "Ko'rsatish", order: 8 };

function InboxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="EmptyState"
      description="Bo'sh ro'yxat, natijasiz qidiruv, birinchi kirish. Markazlangan, tugmalar tor ekranda ustma-ust."
    >
      <DemoSection title="To'liq">
        <EmptyState
          icon={<InboxIcon />}
          title="Buyurtmalar hali yo'q"
          description="Birinchi buyurtma kelganda shu yerda ko'rinadi."
          action={<Button variant="primary">Mahsulot qo'shish</Button>}
          secondaryAction={<Button variant="ghost">Qo'llanma</Button>}
        />
      </DemoSection>

      <DemoSection title="O'lchamlar" description={<Code>size + bordered</Code>}>
        <DemoGrid min={220}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <EmptyState
              key={size}
              bordered
              size={size}
              icon={<SearchIcon />}
              title="Hech narsa topilmadi"
              description={`size="${size}"`}
            />
          ))}
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Minimal" description="Faqat title">
        <EmptyState bordered size="sm" title="Izohlar yo'q" headingLevel={4} />
      </DemoSection>
    </DemoPage>
  );
}
