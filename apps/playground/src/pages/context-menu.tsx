import { ContextMenu, toast } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'ContextMenu', group: 'Overlay', order: 6.5 };

function Area({ children }: { children: string }) {
  return (
    <div className="grid h-32 w-full max-w-sm place-items-center rounded-xl border border-dashed border-border-strong bg-surface-muted text-sm text-text-muted select-none">
      {children}
    </div>
  );
}

export default function Page() {
  const [grid, setGrid] = useState(true);
  const [sort, setSort] = useState('name');

  return (
    <DemoPage
      title="ContextMenu"
      description={
        <>
          O'ng tugma (telefonda — uzoq bosish) bilan ochiladigan menyu. Qismlar va stillar{' '}
          <Code>DropdownMenu</Code> bilan bir xil; panel kursor turgan joyda ochiladi.
        </>
      }
    >
      <DemoSection title="Asosiy" description="Ikonka, Kbd yorlig'i, disabled va danger.">
        <DemoRow>
          <ContextMenu>
            <ContextMenu.Trigger asChild>
              <div className="w-full max-w-sm">
                <Area>O'ng tugma bilan bosing</Area>
              </div>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Label>Fayl</ContextMenu.Label>
              <ContextMenu.Item shortcut={['mod', 'E']} onSelect={() => toast('Tahrirlash')}>
                Tahrirlash
              </ContextMenu.Item>
              <ContextMenu.Item shortcut={['mod', 'D']} onSelect={() => toast('Nusxa')}>
                Nusxa olish
              </ContextMenu.Item>
              <ContextMenu.Item disabled>Arxivlash</ContextMenu.Item>
              <ContextMenu.Separator />
              <ContextMenu.Item variant="danger" onSelect={() => toast("O'chirildi")}>
                O'chirish
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Checkbox, Radio va Sub">
        <DemoRow>
          <ContextMenu>
            <ContextMenu.Trigger asChild>
              <div className="w-full max-w-sm">
                <Area>{`Panjara: ${grid ? 'ha' : "yo'q"} · saralash: ${sort}`}</Area>
              </div>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
                Panjara
              </ContextMenu.CheckboxItem>
              <ContextMenu.Separator />
              <ContextMenu.RadioGroup value={sort} onValueChange={setSort}>
                <ContextMenu.RadioItem value="name">Nomi bo'yicha</ContextMenu.RadioItem>
                <ContextMenu.RadioItem value="date">Sana bo'yicha</ContextMenu.RadioItem>
              </ContextMenu.RadioGroup>
              <ContextMenu.Separator />
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger>Ulashish</ContextMenu.SubTrigger>
                <ContextMenu.SubContent>
                  <ContextMenu.Item>Telegram</ContextMenu.Item>
                  <ContextMenu.Item>Email</ContextMenu.Item>
                </ContextMenu.SubContent>
              </ContextMenu.Sub>
            </ContextMenu.Content>
          </ContextMenu>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Disabled trigger" description="O'ng tugma brauzer menyusini ochadi.">
        <DemoRow>
          <ContextMenu>
            <ContextMenu.Trigger asChild disabled>
              <div className="w-full max-w-sm">
                <Area>O'chirilgan hudud</Area>
              </div>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Item>Bir</ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
