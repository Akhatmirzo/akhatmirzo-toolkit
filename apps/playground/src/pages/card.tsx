import { Avatar, Badge, Card } from '@akhatmirzo/ui';
import { Code, DemoGrid, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Card', group: "Ko'rsatish", order: 3 };

const variants = [
  { variant: 'elevated', note: 'default — shadow-sm + border' },
  { variant: 'outline', note: 'faqat chegara' },
  { variant: 'soft', note: 'surface-muted fon' },
] as const;

const paddings = [
  { padding: 'none', px: 0 },
  { padding: 'sm', px: 16 },
  { padding: 'md', px: 24 },
  { padding: 'lg', px: 32 },
] as const;

const actionClass =
  'focus-ring inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium transition-colors duration-base';

export default function Page() {
  return (
    <DemoPage
      title="Card"
      description="Kontent bloki. Kompozitsiya: Card.Header (title, description, action), Card.Body, Card.Footer."
    >
      <DemoSection title="Variantlar" className="bg-background">
        <DemoGrid min={220}>
          {variants.map(({ variant, note }) => (
            <Card key={variant} variant={variant}>
              <Card.Header title={variant} description={note} />
              <Card.Body className="text-text-muted">Karta mazmuni shu yerda bo'ladi.</Card.Body>
            </Card>
          ))}
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Padding"
        description="none / sm / md (default, 24px) / lg"
        className="bg-background"
      >
        <DemoGrid min={180}>
          {paddings.map(({ padding, px }) => (
            <Card key={padding} padding={padding} variant="outline">
              <div className="rounded-md bg-primary-soft p-2 text-xs font-medium text-primary-soft-foreground">
                {padding} · {px}px
              </div>
            </Card>
          ))}
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Kompozitsiya"
        description="Header + Body + Footer"
        className="bg-background"
      >
        <Card className="max-w-md">
          <Card.Header
            title="Buyurtma #1042"
            description="Bugun, 14:20"
            action={
              <Badge color="primary" dot>
                Yangi
              </Badge>
            }
          />
          <Card.Body>
            <div className="flex items-center gap-3">
              <Avatar name="Sarvar Abduxoliqov" size="sm" />
              <div className="flex flex-col">
                <span className="font-medium">Sarvar Abduxoliqov</span>
                <span className="text-text-muted">3 ta mahsulot · 245 000 so'm</span>
              </div>
            </div>
          </Card.Body>
          <Card.Footer className="justify-end">
            <button
              type="button"
              className={`${actionClass} bg-transparent text-text-subtle hover:bg-surface-muted`}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              className={`${actionClass} bg-primary text-primary-foreground hover:bg-primary-hover`}
            >
              Tasdiqlash
            </button>
          </Card.Footer>
        </Card>
      </DemoSection>

      <DemoSection
        title="Interaktiv"
        description={
          <>
            <Code>interactive</Code> — hover'da soya md ga ko'tariladi. Bu faqat stil: klaviatura
            ishlashi uchun doim <Code>asChild</Code> bilan <Code>{'<a>'}</Code> yoki{' '}
            <Code>{'<button>'}</Code> bering (Tab bilan fokuslab ko'ring)
          </>
        }
        className="bg-background"
      >
        <DemoGrid min={220}>
          {variants.map(({ variant }) => (
            <Card key={variant} variant={variant} interactive asChild>
              <a href="#/card">
                <Card.Header title={`Havola · ${variant}`} description="Kursorni olib keling" />
              </a>
            </Card>
          ))}
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Padding none — rasm bilan" className="bg-background">
        <Card padding="none" className="max-w-sm overflow-hidden">
          <div className="h-32 bg-linear-to-br from-primary to-info" />
          <div className="flex flex-col gap-3 p-6">
            <Card.Header title="Toshkent bo'ylab sayohat" description="2 kun · 4 ta joy" />
            <Card.Footer>
              <Badge color="success" size="sm">
                Mavjud
              </Badge>
              <Badge size="sm">Guruh</Badge>
            </Card.Footer>
          </div>
        </Card>
      </DemoSection>
    </DemoPage>
  );
}
