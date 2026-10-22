'use client';

import { searchMatch } from '@akhatmirzo/core';
import { useDebounce } from '@akhatmirzo/hooks';
import {
  Button,
  Card,
  DateRangePicker,
  Input,
  Select,
  VirtualList,
  type DateRangeValue,
} from '@akhatmirzo/ui';
import { FilterX, Search, SearchX } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useBank } from './bank-store';
import { brandLabels, shortCard, type Transaction } from './data';
import { TxDetailsDrawer } from './tx-details-drawer';
import { dayLabel, EmptyState, Money, PageHeader, TxRow } from './ui';

type TypeFilter = 'all' | 'income' | 'expense' | 'transfer' | 'payment';

const typeLabels: Record<TypeFilter, string> = {
  all: 'Barcha turlar',
  income: 'Kirim',
  expense: 'Chiqim',
  transfer: "O'tkazmalar",
  payment: "To'lovlar",
};

type Row =
  | { type: 'header'; key: string; label: string; total: number }
  | { type: 'tx'; key: string; tx: Transaction };

function matchesType(tx: Transaction, type: TypeFilter) {
  switch (type) {
    case 'income':
      return tx.amount > 0;
    case 'expense':
      return tx.amount < 0;
    case 'transfer':
      return tx.kind === 'transfer';
    case 'payment':
      return tx.kind === 'payment';
    default:
      return true;
  }
}

/** Sana bo'yicha guruhlab, sarlavha + operatsiya qatorlariga yoyadi */
function toRows(list: Transaction[], now: Date): Row[] {
  const rows: Row[] = [];
  let current: Extract<Row, { type: 'header' }> | null = null;
  for (const tx of list) {
    const label = dayLabel(tx.date, now);
    if (!current || current.label !== label) {
      current = { type: 'header', key: `h-${label}`, label, total: 0 };
      rows.push(current);
    }
    if (tx.status !== 'failed') current.total += tx.amount;
    rows.push({ type: 'tx', key: tx.id, tx });
  }
  return rows;
}

export function HistoryView() {
  const { transactions, cards, hideBalance } = useBank();
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [cardId, setCardId] = useState(params.get('card') ?? 'all');
  const [range, setRange] = useState<DateRangeValue | null>(null);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const debounced = useDebounce(query, 200);

  const filtered = useMemo(() => {
    const from = range?.from?.getTime() ?? -Infinity;
    // `to` — kun oxirigacha
    const to = range?.to ? range.to.getTime() + 86_399_999 : Infinity;
    return transactions.filter((tx) => {
      const t = new Date(tx.date).getTime();
      if (t < from || t > to) return false;
      if (cardId !== 'all' && tx.cardId !== cardId) return false;
      if (!matchesType(tx, type)) return false;
      return searchMatch(`${tx.title} ${tx.description} ${tx.counterparty ?? ''}`, debounced).match;
    });
  }, [transactions, range, cardId, type, debounced]);

  const rows = useMemo(() => toRows(filtered, new Date()), [filtered]);
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filtered) {
      if (tx.status === 'failed') continue;
      if (tx.amount > 0) income += tx.amount;
      else expense += -tx.amount;
    }
    return { income, expense };
  }, [filtered]);

  const hasFilters = query !== '' || type !== 'all' || cardId !== 'all' || range !== null;
  const clearFilters = () => {
    setQuery('');
    setType('all');
    setCardId('all');
    setRange(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Operatsiyalar tarixi"
        description={`Jami ${transactions.length} ta operatsiya`}
      />

      <Card padding="sm" className="gap-3">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,170px)_minmax(0,170px)_minmax(0,260px)]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search />}
            placeholder="Qidirish: Korzinka, Aziz, taksi..."
            aria-label="Operatsiyalarni qidirish"
            clearable
            onClear={() => setQuery('')}
            className="col-span-2 xl:col-span-1"
          />
          <Select
            value={type}
            onValueChange={(v) => setType(v as TypeFilter)}
            aria-label="Operatsiya turi"
          >
            {(Object.keys(typeLabels) as TypeFilter[]).map((t) => (
              <Select.Item key={t} value={t}>
                {typeLabels[t]}
              </Select.Item>
            ))}
          </Select>
          <Select value={cardId} onValueChange={setCardId} aria-label="Karta">
            <Select.Item value="all">Barcha kartalar</Select.Item>
            {cards.map((c) => (
              <Select.Item key={c.id} value={c.id}>
                {brandLabels[c.brand]} {shortCard(c.number)}
              </Select.Item>
            ))}
          </Select>
          <DateRangePicker
            value={range}
            onValueChange={setRange}
            presets
            clearable
            maxDate={new Date()}
            aria-label="Sanalar oralig'i"
            labels={{ placeholder: "Sana oralig'i" }}
            className="col-span-2 min-w-0 xl:col-span-1"
            triggerClassName="w-full"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-3 text-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-1" aria-live="polite">
            <span className="text-text-muted">
              Topildi: <span className="font-semibold text-text">{filtered.length}</span>
            </span>
            <span className="text-text-muted">
              Kirim:{' '}
              <Money
                value={totals.income}
                hidden={hideBalance}
                className="font-semibold text-success-soft-foreground"
              />
            </span>
            <span className="text-text-muted">
              Chiqim:{' '}
              <Money
                value={totals.expense}
                hidden={hideBalance}
                className="font-semibold text-text"
              />
            </span>
          </div>
          {hasFilters && (
            <Button size="sm" variant="ghost" leftIcon={<FilterX />} onClick={clearFilters}>
              Filtrlarni tozalash
            </Button>
          )}
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <VirtualList
          items={rows}
          aria-label="Operatsiyalar"
          height="max(420px, calc(100dvh - 22rem))"
          estimateSize={(i) => (rows[i]?.type === 'header' ? 40 : 64)}
          getItemKey={(row) => row.key}
          className="px-2"
          emptyState={
            <EmptyState
              icon={SearchX}
              title="Operatsiya topilmadi"
              description="Filtrlarni o'zgartiring yoki tozalang."
              action={
                hasFilters ? (
                  <Button size="sm" onClick={clearFilters}>
                    Filtrlarni tozalash
                  </Button>
                ) : undefined
              }
            />
          }
          renderItem={(row) =>
            row.type === 'header' ? (
              <div className="flex h-10 items-end justify-between gap-3 px-2 pb-1.5">
                <h2 className="text-xs font-semibold tracking-wide text-text-muted uppercase">
                  {row.label}
                </h2>
                <Money
                  value={row.total}
                  signed
                  hidden={hideBalance}
                  className="text-xs font-medium text-text-muted"
                />
              </div>
            ) : (
              <TxRow tx={row.tx} onSelect={setSelected} hidden={hideBalance} />
            )
          }
        />
      </Card>

      <TxDetailsDrawer tx={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
