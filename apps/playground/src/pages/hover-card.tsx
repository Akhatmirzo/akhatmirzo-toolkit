import { Avatar, Button, HoverCard } from '@akhatmirzo/ui';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'HoverCard', group: 'Overlay', order: 6.6 };

const sides = ['top', 'right', 'bottom', 'left'] as const;

export default function Page() {
  return (
    <DemoPage
      title="HoverCard"
      description={
        <>
          Havola ustiga kursor kelganda (yoki fokusda) chiqadigan karta. Kechikish:{' '}
          <Code>openDelay</Code> 500ms, <Code>closeDelay</Code> 200ms. Panel Popover bilan bir xil;
          touch'da ochilmaydi.
        </>
      }
    >
      <DemoSection title="Profil">
        <DemoRow>
          <HoverCard>
            <HoverCard.Trigger asChild>
              <a
                href="#profil"
                className="focus-ring rounded-sm font-medium text-primary underline"
              >
                @akhatmirzo
              </a>
            </HoverCard.Trigger>
            <HoverCard.Content align="start">
              <div className="flex gap-3">
                <Avatar name="Akhatmirzo Umarov" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">Akhatmirzo Umarov</span>
                  <span className="text-text-muted">Frontend dasturchi, Toshkent.</span>
                </div>
              </div>
            </HoverCard.Content>
          </HoverCard>
        </DemoRow>
      </DemoSection>

      <DemoSection title="O'lchamlar" description="sm — 240px, md — 320px.">
        <DemoRow>
          {(['sm', 'md'] as const).map((size) => (
            <HoverCard key={size} openDelay={200}>
              <HoverCard.Trigger asChild>
                <Button variant="outline">{size}</Button>
              </HoverCard.Trigger>
              <HoverCard.Content size={size}>
                Chorsu Market — Toshkentdagi onlayn do'kon, 12 000+ mahsulot.
              </HoverCard.Content>
            </HoverCard>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="Joylashuv">
        <DemoRow>
          {sides.map((side) => (
            <HoverCard key={side} openDelay={150} closeDelay={100}>
              <HoverCard.Trigger asChild>
                <Button variant="ghost">{side}</Button>
              </HoverCard.Trigger>
              <HoverCard.Content side={side} size="sm">
                <b>{side}</b> tomonda
              </HoverCard.Content>
            </HoverCard>
          ))}
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
