import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CommandPalette,
  type CommandPaletteGroup,
  type CommandPaletteItem,
} from './command-palette';

const RECENT_KEY = 'test:recent';

function makeGroups(handlers: Record<string, () => void> = {}): CommandPaletteGroup[] {
  const on = (label: string) => handlers[label] ?? (() => {});
  return [
    {
      heading: 'Sahifalar',
      items: [
        { label: 'Bosh sahifa', onSelect: on('Bosh sahifa') },
        { label: 'Buyurtmalar', onSelect: on('Buyurtmalar') },
        { label: 'Sozlamalar', shortcut: ['mod', ','], onSelect: on('Sozlamalar') },
      ],
    },
    {
      heading: 'Amallar',
      items: [
        { label: 'Yangi buyurtma', shortcut: ['mod', 'N'], onSelect: on('Yangi buyurtma') },
        { label: "Mijoz qo'shish", onSelect: on("Mijoz qo'shish") },
        {
          label: 'Mavzu',
          keywords: ['tungi rejim'],
          page: {
            title: 'Mavzu',
            placeholder: 'Mavzu tanlang...',
            groups: [
              {
                heading: 'Mavzu',
                items: [
                  { label: "Yorug'", onSelect: on("Yorug'") },
                  { label: "Qorong'i", onSelect: on("Qorong'i") },
                ],
              },
            ],
          },
        },
        { label: 'Arxivlash', disabled: true, onSelect: on('Arxivlash') },
      ],
    },
    {
      heading: 'Mijozlar',
      searchOnly: true,
      items: [{ label: 'Aziza Karimova', onSelect: on('Aziza Karimova') }],
    },
  ];
}

const input = () => screen.getByRole('combobox', { name: 'Buyruq qidirish' });
const optionNames = () =>
  screen
    .queryAllByRole('option')
    .map((o) => o.querySelector('[data-slot="command-palette-item-label"]')!.textContent);
const selectedOption = () =>
  screen.getAllByRole('option').find((o) => o.getAttribute('aria-selected') === 'true');

function renderPalette(props: Partial<Parameters<typeof CommandPalette>[0]> = {}) {
  return render(<CommandPalette groups={makeGroups()} recentKey={RECENT_KEY} {...props} />);
}

beforeEach(() => {
  localStorage.clear();
});

describe('CommandPalette', () => {
  it('Ctrl+K ochadi va yopadi; dialog, qidiruv fokusda, yordam qatori', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderPalette({ onOpenChange });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.keyboard('{Control>}k{/Control}');
    const dialog = await screen.findByRole('dialog', { name: 'Buyruqlar' });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(dialog).toHaveAttribute('data-slot', 'command-palette');
    expect(dialog).toHaveClass('rounded-2xl', 'max-w-140', 'top-[18vh]', 'bg-surface');
    await waitFor(() => expect(input()).toHaveFocus());
    expect(input()).toHaveAttribute('placeholder', 'Qidirish yoki buyruq yozish...');
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'Buyruqlar' })).toBeInTheDocument();
    const footer = dialog.querySelector('[data-slot="command-palette-footer"]')!;
    expect(footer).toHaveTextContent('↑↓yurish');
    expect(footer).toHaveTextContent('↵tanlash');
    expect(footer).toHaveTextContent('Escyopish');

    // Input ichida ham ishlaydi
    await user.keyboard('{Control>}k{/Control}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('bo`sh qidiruvda guruhlar (searchOnly yashirin), birinchi element tanlangan, shortcut Kbd', async () => {
    renderPalette({ defaultOpen: true });
    await screen.findByRole('dialog');
    expect(screen.getByText('Sahifalar')).toBeInTheDocument();
    expect(screen.getByText('Amallar')).toBeInTheDocument();
    expect(screen.queryByText('Mijozlar')).not.toBeInTheDocument();
    expect(screen.queryByText('Oxirgi ishlatilganlar')).not.toBeInTheDocument();
    expect(optionNames()).toHaveLength(7);
    await waitFor(() => expect(selectedOption()).toHaveTextContent('Bosh sahifa'));
    const settings = screen.getByRole('option', { name: /Sozlamalar/ });
    expect(settings.querySelector('kbd')).toHaveTextContent('Ctrl,');
    expect(screen.getByRole('option', { name: 'Arxivlash' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('fuzzy qidiruv: harflar ketma-ketligi, qalin harflar, o`zbek normallashtirish, kalit so`zlar', async () => {
    const user = userEvent.setup();
    renderPalette({ defaultOpen: true });
    await waitFor(() => expect(input()).toHaveFocus());

    await user.type(input(), 'ybu');
    expect(optionNames()).toEqual(['Yangi buyurtma']);
    const marks = screen.getByRole('option').querySelectorAll('mark');
    expect(Array.from(marks).map((m) => m.textContent)).toEqual(['Y', 'bu']);
    expect(marks[0]).toHaveClass('font-bold');

    // searchOnly guruh qidiruvda chiqadi
    await user.clear(input());
    await user.type(input(), 'aziza');
    expect(optionNames()).toEqual(['Aziza Karimova']);
    expect(screen.getByText('Mijozlar')).toBeInTheDocument();

    // Apostrof varianti va kirill
    await user.clear(input());
    await user.type(input(), 'qoʻsh');
    expect(optionNames()).toEqual(["Mijoz qo'shish"]);
    await user.clear(input());
    await user.type(input(), 'буюртма');
    expect(optionNames()).toEqual(expect.arrayContaining(['Buyurtmalar', 'Yangi buyurtma']));

    // Kalit so'z bo'yicha
    await user.clear(input());
    await user.type(input(), 'tungi');
    expect(optionNames()).toEqual(['Mavzu']);
  });

  it('bo`sh natija holati', async () => {
    const user = userEvent.setup();
    renderPalette({ defaultOpen: true });
    await waitFor(() => expect(input()).toHaveFocus());
    await user.type(input(), 'zzzq');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('Hech narsa topilmadi')).toBeInTheDocument();
    expect(screen.getByText(`"zzzq" bo'yicha natija yo'q`)).toBeInTheDocument();
  });

  it('klaviatura: ↓ ↑ yuradi (aylanib), Enter bajaradi va yopadi, fokus trigger`ga qaytadi', async () => {
    const user = userEvent.setup();
    const onNew = vi.fn();
    render(
      <CommandPalette groups={makeGroups({ 'Yangi buyurtma': onNew })} recentKey={RECENT_KEY}>
        <button type="button">Qidirish</button>
      </CommandPalette>,
    );
    const trigger = screen.getByRole('button', { name: 'Qidirish' });
    await user.click(trigger);
    await waitFor(() => expect(input()).toHaveFocus());
    await waitFor(() => expect(selectedOption()).toHaveTextContent('Bosh sahifa'));

    await user.keyboard('{ArrowUp}');
    expect(selectedOption()).toHaveTextContent('Mavzu');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(selectedOption()).toHaveTextContent('Buyurtmalar');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(selectedOption()).toHaveTextContent('Yangi buyurtma');
    expect(input().getAttribute('aria-activedescendant')).toBe(selectedOption()!.id);

    await user.keyboard('{Enter}');
    expect(onNew).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('Esc yopadi; sichqoncha bilan bosish bajaradi; disabled bajarilmaydi', async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();
    const onHome = vi.fn();
    render(
      <CommandPalette
        groups={makeGroups({ Arxivlash: onArchive, 'Bosh sahifa': onHome })}
        recentKey={RECENT_KEY}
        defaultOpen
      />,
    );
    await waitFor(() => expect(input()).toHaveFocus());
    await user.click(screen.getByRole('option', { name: 'Arxivlash' }));
    expect(onArchive).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Bosh sahifa' }));
    expect(onHome).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.keyboard('{Control>}k{/Control}');
    await waitFor(() => expect(input()).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('oxirgi ishlatilganlar: bo`sh qidiruvda birinchi guruh, localStorage, limit', async () => {
    const user = userEvent.setup();
    renderPalette({ recentLimit: 2 });
    const run = async (label: string) => {
      await user.keyboard('{Control>}k{/Control}');
      await waitFor(() => expect(input()).toHaveFocus());
      await user.type(input(), label);
      await user.keyboard('{Enter}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    };
    await run('Buyurtmalar');
    await run('Sozlamalar');
    await run('Yangi buyurtma');
    expect(JSON.parse(localStorage.getItem(RECENT_KEY)!)).toEqual(['Yangi buyurtma', 'Sozlamalar']);

    await user.keyboard('{Control>}k{/Control}');
    await waitFor(() => expect(input()).toHaveFocus());
    const groups = screen.getAllByRole('group');
    expect(groups[0]).toHaveAccessibleName('Oxirgi ishlatilganlar');
    expect(
      within(groups[0]!)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['Yangi buyurtmaCtrlN', 'SozlamalarCtrl,']);
    expect(optionNames().slice(0, 2)).toEqual(['Yangi buyurtma', 'Sozlamalar']);
    await waitFor(() => expect(selectedOption()).toHaveTextContent('Yangi buyurtma'));

    // Qidiruvda yashirinadi
    await user.type(input(), 'boshs');
    expect(screen.queryByText('Oxirgi ishlatilganlar')).not.toBeInTheDocument();
  });

  it('recent={false}: guruh yo`q va saqlanmaydi', async () => {
    const user = userEvent.setup();
    renderPalette({ recent: false, defaultOpen: true });
    await waitFor(() => expect(input()).toHaveFocus());
    await user.click(screen.getByRole('option', { name: 'Buyurtmalar' }));
    expect(localStorage.getItem(RECENT_KEY)).toBeNull();
  });

  it('ichki sahifa: ochiladi, Backspace bo`sh qidiruvda orqaga, orqaga tugmasi', async () => {
    const user = userEvent.setup();
    const onDark = vi.fn();
    render(
      <CommandPalette
        groups={makeGroups({ "Qorong'i": onDark })}
        recentKey={RECENT_KEY}
        defaultOpen
      />,
    );
    await waitFor(() => expect(input()).toHaveFocus());
    await user.click(screen.getByRole('option', { name: 'Mavzu' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(optionNames()).toEqual(["Yorug'", "Qorong'i"]);
    expect(input()).toHaveAttribute('placeholder', 'Mavzu tanlang...');
    expect(input()).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Orqaga: Mavzu' })).toBeInTheDocument();

    // Yozilgan matn bo'lsa Backspace faqat harfni o'chiradi
    await user.type(input(), 'q');
    expect(optionNames()).toEqual(["Qorong'i"]);
    await user.keyboard('{Backspace}');
    expect(optionNames()).toEqual(["Yorug'", "Qorong'i"]);
    await user.keyboard('{Backspace}');
    expect(screen.queryByRole('button', { name: /Orqaga/ })).not.toBeInTheDocument();
    expect(screen.getByText('Sahifalar')).toBeInTheDocument();

    // Qayta kirib, tugma orqali qaytish
    await user.click(screen.getByRole('option', { name: 'Mavzu' }));
    await user.click(screen.getByRole('button', { name: 'Orqaga: Mavzu' }));
    expect(screen.getByText('Sahifalar')).toBeInTheDocument();
    expect(input()).toHaveFocus();

    // Ichki element bajariladi va oyna yopiladi
    await user.click(screen.getByRole('option', { name: 'Mavzu' }));
    await user.click(screen.getByRole('option', { name: "Qorong'i" }));
    expect(onDark).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('qayta ochilganda qidiruv va sahifa tozalanadi', async () => {
    const user = userEvent.setup();
    renderPalette();
    await user.keyboard('{Control>}k{/Control}');
    await waitFor(() => expect(input()).toHaveFocus());
    await user.click(screen.getByRole('option', { name: 'Mavzu' }));
    await user.type(input(), 'yor');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.keyboard('{Control>}k{/Control}');
    await waitFor(() => expect(input()).toHaveFocus());
    expect(input()).toHaveValue('');
    expect(screen.getByText('Sahifalar')).toBeInTheDocument();
  });

  it('onSearch: debounce, yuklanish, server natijalari alohida guruhda, eski so`rov bekor', async () => {
    const user = userEvent.setup();
    const resolvers: Array<(items: CommandPaletteItem[]) => void> = [];
    const signals: AbortSignal[] = [];
    const onSelect = vi.fn();
    const onSearch = vi.fn(
      (_q: string, { signal }: { signal: AbortSignal }) =>
        new Promise<CommandPaletteItem[]>((resolve) => {
          signals.push(signal);
          resolvers.push(resolve);
        }),
    );
    renderPalette({ defaultOpen: true, onSearch });
    await waitFor(() => expect(input()).toHaveFocus());

    await user.type(input(), 'aka');
    expect(screen.getByRole('status')).toHaveTextContent('Qidirilmoqda...');
    await waitFor(() => expect(onSearch).toHaveBeenCalledTimes(1));
    expect(onSearch.mock.calls[0]![0]).toBe('aka');

    await user.type(input(), 'r');
    await waitFor(() => expect(onSearch).toHaveBeenCalledTimes(2));
    expect(signals[0]!.aborted).toBe(true);

    await act(async () => {
      resolvers[1]!([{ label: 'Akram Rahimov', description: '+998 90 123 45 67', onSelect }]);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    const group = screen.getByRole('group', { name: 'Natijalar' });
    const [option] = within(group).getAllByRole('option');
    expect(option).toHaveTextContent('Akram Rahimov');
    expect(option).toHaveTextContent('+998 90 123 45 67');
    await user.click(option!);
    expect(onSelect).toHaveBeenCalled();
    // Server natijalari oxirgilarga yozilmaydi
    expect(localStorage.getItem(RECENT_KEY)).toBeNull();
  });

  it('boshqariladigan open va hotkey={false}', async () => {
    const user = userEvent.setup();
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Ochish
          </button>
          <span data-testid="state">{open ? 'ochiq' : 'yopiq'}</span>
          <CommandPalette
            groups={makeGroups()}
            recentKey={RECENT_KEY}
            hotkey={false}
            open={open}
            onOpenChange={setOpen}
            labels={{ title: 'Buyruqlar oynasi', empty: 'Topilmadi' }}
          />
        </>
      );
    }
    render(<Demo />);
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    expect(await screen.findByRole('dialog', { name: 'Buyruqlar oynasi' })).toBeInTheDocument();
    await waitFor(() => expect(input()).toHaveFocus());
    await user.type(input(), 'zzzq');
    expect(screen.getByText('Topilmadi')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('yopiq'));
  });
});
