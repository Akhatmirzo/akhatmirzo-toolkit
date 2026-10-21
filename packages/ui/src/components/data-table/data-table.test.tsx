import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableColumn, type DataTableProps } from './index';

interface Order {
  id: number;
  customer: string;
  status: 'paid' | 'pending' | 'cancelled';
  total: number;
  date: Date;
}

const names = [
  'Jasur Karimov',
  "Bekzod G'aniyev",
  'Malika Rahimova',
  'Farhod Tursunov',
  'Otabek Qodirov',
];
const statuses = ['paid', 'pending', 'cancelled'] as const;

const orders: Order[] = Array.from({ length: 30 }, (_, i) => ({
  id: 1001 + i,
  customer: names[i % names.length] as string,
  status: statuses[i % 3] as Order['status'],
  total: 100_000 + ((i * 7919) % 50) * 10_000,
  date: new Date(2026, 9, 1 + (i % 28)),
}));

const statusLabels = { paid: "To'langan", pending: 'Kutilmoqda', cancelled: 'Bekor qilingan' };

const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: '№', sortable: true, numeric: true, width: 80 },
  { key: 'customer', header: 'Mijoz', sortable: true },
  {
    key: 'status',
    header: 'Holat',
    filter: 'multiselect',
    filterOptions: statuses.map((s) => ({ value: s, label: statusLabels[s] })),
    cell: (r) => statusLabels[r.status],
  },
  { key: 'total', header: 'Summa', sortable: true, numeric: true, filter: 'range' },
];

function setup(props: Partial<DataTableProps<Order>> = {}) {
  const user = userEvent.setup();
  const utils = render(
    <DataTable
      label="Buyurtmalar"
      data={orders}
      columns={columns}
      pagination={{ pageSize: 10 }}
      {...props}
    />,
  );
  return { user, ...utils };
}

const bodyRows = () =>
  within(screen.getByRole('table'))
    .getAllByRole('row')
    .filter((r) => r.closest('tbody'));
const firstCells = () => bodyRows().map((r) => within(r).getAllByRole('cell')[0]?.textContent);

describe('DataTable', () => {
  it('jadval, sarlavhalar, qatorlar va sahifalash ma’lumoti', () => {
    const ref = createRef<HTMLDivElement>();
    setup({ ref, className: 'tashqi' });
    const table = screen.getByRole('table', { name: 'Buyurtmalar' });
    expect(within(table).getAllByRole('columnheader')).toHaveLength(4);
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText('1–10 / 30')).toBeInTheDocument();
    expect(ref.current).toHaveAttribute('data-slot', 'data-table');
    expect(ref.current).toHaveClass('tashqi', 'rounded-xl', 'bg-surface');
    expect(ref.current).toHaveAttribute('data-density', 'comfortable');
  });

  it('raqamli ustun o‘ngga tekislanadi va tabular-nums; qator balandligi density bo‘yicha', () => {
    setup({ density: 'compact' });
    const row = bodyRows()[0] as HTMLElement;
    const idCell = within(row).getAllByRole('cell')[0] as HTMLElement;
    expect(idCell).toHaveClass('text-right', 'tabular-nums');
    expect(row).toHaveStyle({ height: '40px' });
    // cell berilmasa — qiymat o'zi
    expect(within(row).getAllByRole('cell')[3]).toHaveTextContent(/^\d+$/);
  });

  it('saralash: o‘sish → kamayish → o‘chiq, aria-sort bilan', async () => {
    const { user } = setup();
    const th = screen.getByRole('columnheader', { name: /Summa/ });
    expect(th).toHaveAttribute('aria-sort', 'none');
    const button = within(th).getByRole('button');

    await user.click(button);
    expect(th).toHaveAttribute('aria-sort', 'ascending');
    const asc = bodyRows().map((r) => r.querySelectorAll('td')[3]?.textContent);
    const nums = asc.map((t) => Number(t?.replace(/\s/g, '')));
    expect(nums).toEqual([...nums].sort((a, b) => a - b));

    await user.click(button);
    expect(th).toHaveAttribute('aria-sort', 'descending');

    await user.click(button);
    expect(th).toHaveAttribute('aria-sort', 'none');
    expect(firstCells()[0]).toBe('1001');
  });

  it('Shift bilan bir nechta ustun bo‘yicha saralash; Enter bilan klaviaturadan', async () => {
    const { user } = setup();
    const customer = screen.getByRole('columnheader', { name: /Mijoz/ });
    const id = screen.getByRole('columnheader', { name: /№/ });
    within(customer).getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(customer).toHaveAttribute('aria-sort', 'ascending');

    await user.keyboard('{Shift>}');
    await user.click(within(id).getByRole('button'));
    await user.keyboard('{/Shift}');
    expect(customer).toHaveAttribute('aria-sort', 'ascending');
    expect(id).toHaveAttribute('aria-sort', 'ascending');
    // Birinchi qator: alifbo bo'yicha birinchi mijoz, eng kichik №
    const first = bodyRows()[0] as HTMLElement;
    expect(first).toHaveTextContent("Bekzod G'aniyev");
    expect(first).toHaveTextContent('1002');
  });

  it('qidiruv: 300ms debounce, o‘zbek harflari va kirillga sezgir emas', async () => {
    const { user } = setup({ searchable: true });
    const input = screen.getByRole('searchbox', { name: 'Jadvalda qidirish' });
    await user.type(input, 'gʻaniyev');
    // debounce tugamaguncha o'zgarmaydi
    expect(bodyRows()).toHaveLength(10);
    await waitFor(() => expect(screen.getByText('1–6 / 6')).toBeInTheDocument());
    bodyRows().forEach((r) => expect(r).toHaveTextContent("Bekzod G'aniyev"));

    await user.clear(input);
    await user.type(input, 'Жасур');
    await waitFor(() => expect(bodyRows()[0]).toHaveTextContent('Jasur Karimov'));
    expect(screen.getByText('1–6 / 6')).toBeInTheDocument();
    bodyRows().forEach((r) => expect(r).toHaveTextContent('Jasur Karimov'));
  });

  it('filtr Popover’i: multiselect → Badge, ✕ bilan olib tashlanadi', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Filtrlar' }));
    const dialog = await screen.findByRole('dialog', { name: 'Filtrlar' });
    const paid = within(dialog).getByRole('checkbox', { name: /To'langan/ });
    // har bir variant yonida soni
    expect(within(dialog).getAllByText('10', { selector: 'span' })).toHaveLength(3);
    await user.click(paid);
    expect(screen.getByText('1–10 / 10')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filtrlar (1)' })).toBeInTheDocument();
    await user.keyboard('{Escape}');

    const chip = document.querySelector('[data-slot="data-table-filter-chip"]') as HTMLElement;
    expect(chip).toHaveTextContent("Holat: To'langan");
    await user.click(within(chip).getByRole('button', { name: 'Holat filtrini olib tashlash' }));
    expect(document.querySelector('[data-slot="data-table-filter-chip"]')).toBeNull();
    expect(screen.getByText('1–10 / 30')).toBeInTheDocument();
  });

  it('sana filtri: DatePicker (dd.MM.yyyy)', async () => {
    const { user } = setup({
      columns: [...columns, { key: 'date', header: 'Sana', filter: 'date' }],
    });
    await user.click(screen.getByRole('button', { name: 'Filtrlar' }));
    const dialog = await screen.findByRole('dialog', { name: 'Filtrlar' });
    const from = within(dialog).getByRole('textbox', { name: 'Sana: Boshlanish' });
    expect(from).not.toHaveAttribute('type', 'date');
    await user.type(from, '20102026');
    expect(from).toHaveValue('20.10.2026');
    await waitFor(() => expect(screen.getByText('1–9 / 9')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Filtrlar (1)' })).toBeInTheDocument();
  });

  it('range filtri: min/max', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Filtrlar' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByRole('spinbutton', { name: 'Summa dan' }), '500000');
    const shown = bodyRows().map((r) =>
      Number(r.querySelectorAll('td')[3]?.textContent?.replace(/\s/g, '')),
    );
    shown.forEach((n) => expect(n).toBeGreaterThanOrEqual(500_000));
    await user.keyboard('{Escape}');
    expect(document.querySelector('[data-slot="data-table-filter-chip"]')).toHaveTextContent(
      'Summa: ≥ 500 000',
    );
  });

  it('tanlash: indeterminate, ommaviy amallar paneli, hammasini tanlash, bekor qilish', async () => {
    const onSelectionChange = vi.fn();
    const bulk = vi.fn((rows: Order[]) => <button type="button">Eksport ({rows.length})</button>);
    const { user } = setup({ selectable: true, onSelectionChange, bulkActions: bulk });
    const all = screen.getByRole('checkbox', { name: 'Hammasini tanlash' });
    const first = screen.getByRole('checkbox', { name: 'Qatorni tanlash: 1001' });

    await user.click(first);
    expect(first).toBeChecked();
    expect(all).toHaveAttribute('aria-checked', 'mixed');
    expect(screen.getByText('1 ta tanlandi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eksport (1)' })).toBeInTheDocument();
    expect(onSelectionChange).toHaveBeenLastCalledWith(['1001'], [orders[0]]);
    expect(bodyRows()[0]).toHaveAttribute('data-selected');
    expect(bodyRows()[0]).not.toHaveAttribute('aria-selected');

    await user.click(all);
    expect(screen.getByText('10 ta tanlandi')).toBeInTheDocument();
    expect(all).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }));
    expect(screen.queryByText(/ta tanlandi/)).not.toBeInTheDocument();
    expect(first).not.toBeChecked();
  });

  it('Shift bilan oraliqni tanlash', async () => {
    const { user } = setup({ selectable: true });
    await user.click(screen.getByRole('checkbox', { name: 'Qatorni tanlash: 1002' }));
    await user.keyboard('{Shift>}');
    await user.click(screen.getByRole('checkbox', { name: 'Qatorni tanlash: 1005' }));
    await user.keyboard('{/Shift}');
    expect(screen.getByText('4 ta tanlandi')).toBeInTheDocument();
  });

  it('klaviatura: Enter — qatorni ochish, Space — tanlash; checkbox bosilsa onRowClick chaqirilmaydi', async () => {
    const onRowClick = vi.fn();
    const { user } = setup({ selectable: true, onRowClick });
    const row = bodyRows()[1] as HTMLElement;
    row.focus();
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith(orders[1]);
    await user.keyboard(' ');
    expect(row).toHaveAttribute('data-selected');

    onRowClick.mockClear();
    await user.click(screen.getByRole('checkbox', { name: 'Qatorni tanlash: 1003' }));
    expect(onRowClick).not.toHaveBeenCalled();
    await user.click(within(bodyRows()[3] as HTMLElement).getByText('1004'));
    expect(onRowClick).toHaveBeenCalledWith(orders[3]);
  });

  it('sahifalash: keyingi sahifa, sahifa raqami, sahifa hajmi', async () => {
    const { user } = setup();
    const nav = screen.getByRole('navigation', { name: 'Sahifalash' });
    expect(within(nav).getByRole('button', { name: 'Oldingi sahifa' })).toBeDisabled();
    expect(within(nav).getByRole('button', { name: '1-sahifa' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await user.click(within(nav).getByRole('button', { name: 'Keyingi sahifa' }));
    expect(screen.getByText('11–20 / 30')).toBeInTheDocument();
    expect(firstCells()[0]).toBe('1011');

    await user.click(within(nav).getByRole('button', { name: '3-sahifa' }));
    expect(screen.getByText('21–30 / 30')).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Keyingi sahifa' })).toBeDisabled();

    await user.click(screen.getByRole('combobox', { name: 'Sahifada' }));
    await user.click(await screen.findByRole('option', { name: '25' }));
    expect(screen.getByText('1–25 / 30')).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(25);
  });

  it('ko‘p sahifada ellipsis', () => {
    const many = Array.from({ length: 248 }, (_, i) => ({ ...orders[0]!, id: i + 1 }));
    render(<DataTable data={many} columns={columns} pagination={{ pageSize: 10 }} />);
    expect(screen.getByText('1–10 / 248')).toBeInTheDocument();
    expect(screen.getByText('…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '25-sahifa' })).toBeInTheDocument();
  });

  it('ustunlarni yashirish (DropdownMenu CheckboxItem)', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Ustunlar' }));
    const item = await screen.findByRole('menuitemcheckbox', { name: 'Mijoz' });
    expect(item).toHaveAttribute('aria-checked', 'true');
    await user.click(item);
    expect(screen.queryByRole('columnheader', { name: /Mijoz/ })).not.toBeInTheDocument();
    // menyu ochiq qoladi
    expect(screen.getByRole('menuitemcheckbox', { name: 'Mijoz' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('birinchi yuklanish: Skeleton qatorlar (sahifa hajmicha), sahifalash yo‘q', () => {
    render(<DataTable data={[]} columns={columns} loading pagination={{ pageSize: 5 }} />);
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-busy', 'true');
    expect(table.querySelectorAll('tbody tr')).toHaveLength(5);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('qayta yuklanish: ma’lumot qoladi, shaffof + progress chizig‘i', () => {
    setup({ loading: true });
    expect(screen.getByRole('progressbar', { name: 'Yuklanmoqda' })).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(10);
    expect(document.querySelector('tbody')).toHaveClass('opacity-60');
  });

  it('bo‘sh holat: matn va amal', () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        empty={{ title: "Hali buyurtmalar yo'q", action: <button type="button">Qo‘shish</button> }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent("Hali buyurtmalar yo'q");
    expect(screen.getByRole('button', { name: 'Qo‘shish' })).toBeInTheDocument();
  });

  it('filtr natijasi bo‘sh: "Filtrlarni tozalash" qidiruv va filtrlarni tozalaydi', async () => {
    const { user } = setup({ searchable: true });
    await user.type(screen.getByRole('searchbox'), 'yoqmaydigan so‘z');
    expect(await screen.findByText('Hech narsa topilmadi')).toBeInTheDocument();
    expect(screen.getByText('0 natija')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Filtrlarni tozalash' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(bodyRows()).toHaveLength(10);
  });

  it('xato: matn va "Qayta urinish"', async () => {
    const onRetry = vi.fn();
    const { user } = setup({ error: 'Tarmoq xatosi', onRetry });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent("Ma'lumotlarni yuklab bo'lmadi");
    expect(alert).toHaveTextContent('Tarmoq xatosi');
    await user.click(screen.getByRole('button', { name: 'Qayta urinish' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('server rejimi: ma’lumot o‘zgartirilmaydi, holat onStateChange orqali', async () => {
    const onStateChange = vi.fn();
    const page = orders.slice(0, 10);
    const { user } = setup({ data: page, manual: true, rowCount: 248, onStateChange });
    expect(screen.getByText('1–10 / 248')).toBeInTheDocument();
    await user.click(
      within(screen.getByRole('columnheader', { name: /Summa/ })).getByRole('button'),
    );
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sorting: [{ id: 'total', desc: false }],
        pagination: { pageIndex: 0, pageSize: 10 },
      }),
    );
    // Lokal saralanmagan
    expect(firstCells()[0]).toBe('1001');

    await user.click(screen.getByRole('button', { name: '2-sahifa' }));
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ pagination: { pageIndex: 1, pageSize: 10 } }),
    );
  });

  it('virtual: faqat ko‘rinadigan qatorlar chiziladi', () => {
    // jsdom'da layout yo'q — scroll konteyner o'lchamini beramiz
    const rect = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400);
    const many = Array.from({ length: 2000 }, (_, i) => ({ ...orders[0]!, id: i + 1 }));
    render(<DataTable data={many} columns={columns} virtual maxHeight={400} />);
    rect.mockRestore();
    const rendered = document.querySelectorAll('tbody tr[data-row-id]');
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(60);
    expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '2001');
    expect(screen.getByText('2 000 ta qator')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('rowActions: alohida ustun, bosilsa qator ochilmaydi', async () => {
    const onRowClick = vi.fn();
    const onAction = vi.fn();
    const { user } = setup({
      onRowClick,
      rowActions: (r) => (
        <button type="button" onClick={() => onAction(r.id)}>
          Amal {r.id}
        </button>
      ),
    });
    expect(screen.getByRole('columnheader', { name: 'Amallar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Amal 1001' }));
    expect(onAction).toHaveBeenCalledWith(1001);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('labels: matnlar o‘zgartiriladi', () => {
    setup({
      searchable: true,
      labels: { searchAria: 'Search', range: (a, b, t) => `${a}-${b} of ${t}` },
    });
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByText('1-10 of 30')).toBeInTheDocument();
  });

  it('sticky birinchi ustun', () => {
    setup({ stickyFirstColumn: true, selectable: true });
    const cells = (bodyRows()[0] as HTMLElement).querySelectorAll('td');
    expect(cells[0]).toHaveClass('sticky', 'left-0');
    expect(cells[1]).toHaveClass('sticky', 'left-11');
    expect(cells[2]).not.toHaveClass('sticky');
  });

  it('o‘chirilgandan keyin sahifa chegaradan chiqsa — oxirgi sahifaga', async () => {
    const { user, rerender } = setup();
    await user.click(screen.getByRole('button', { name: '3-sahifa' }));
    act(() => {
      rerender(
        <DataTable data={orders.slice(0, 15)} columns={columns} pagination={{ pageSize: 10 }} />,
      );
    });
    expect(screen.getByText('11–15 / 15')).toBeInTheDocument();
  });
});
