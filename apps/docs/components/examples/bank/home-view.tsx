'use client';

import { formatDate } from '@akhatmirzo/core';
import { Avatar, Button, Card, cn, IconButton, Tooltip } from '@akhatmirzo/ui';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  History,
  Plus,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { BankCardVisual } from './bank-card';
import { useBank } from './bank-store';
import { categories, contacts, type CategoryId, type Transaction } from './data';
import { TxDetailsDrawer } from './tx-details-drawer';
import { CategoryIcon, Money, SectionTitle, TxRow, useBankHref } from './ui';

function BalanceHero() {
  const { totalBalance, hideBalance, setHideBalance, transactions } = useBank();

  // Joriy oy kirim-chiqimi
  const { income, expense } = useMemo(() => {
    const now = new Date();
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      const d = new Date(tx.date);
      if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) continue;
      if (tx.status !== 'success') continue;
      if (tx.amount > 0) income += tx.amount;
      else expense += -tx.amount;
    }
    return { income, expense };
  }, [transactions]);

  return (
    <section
      aria-labelledby="balance-title"
      className="relative overflow-hidden rounded-3xl bg-primary px-5 py-6 text-primary-foreground shadow-lg sm:px-7"
    >
      <span
        aria-hidden="true"
        className="absolute -top-20 -right-16 size-64 rounded-full bg-primary-foreground/10"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-primary-foreground/5"
      />
      <div className="relative flex items-center gap-2">
        <h2 id="balance-title" className="text-sm font-medium opacity-85">
          Jami balans
        </h2>
        <Tooltip content={hideBalance ? "Balansni ko'rsatish" : 'Balansni yashirish'}>
          <button
            type="button"
            aria-pressed={hideBalance}
            aria-label={hideBalance ? "Balansni ko'rsatish" : 'Balansni yashirish'}
            onClick={() => setHideBalance(!hideBalance)}
            className="focus-ring inline-flex size-8 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
          >
            {hideBalance ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </Tooltip>
      </div>
      <Money
        value={totalBalance}
        hidden={hideBalance}
        className="relative mt-2 block text-3xl font-bold tracking-tight sm:text-4xl"
      />
      <div className="relative mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary-foreground/15">
            <ArrowDownLeft aria-hidden="true" className="size-3.5" />
          </span>
          <span className="opacity-80">Bu oy kirim</span>
          <Money value={income} hidden={hideBalance} className="font-semibold" />
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary-foreground/15">
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </span>
          <span className="opacity-80">Chiqim</span>
          <Money value={expense} hidden={hideBalance} className="font-semibold" />
        </span>
      </div>
    </section>
  );
}

function CardsCarousel() {
  const { cards, hideBalance } = useBank();
  const href = useBankHref();
  const scroller = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = (i: number) => {
    const el = scroller.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (!el || !item) return;
    el.scrollTo({ left: item.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const el = scroller.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    setIndex(Math.round(el.scrollLeft / (first.offsetWidth + 16)));
  };

  const total = cards.length + 1; // + "Karta qo'shish" plitkasi

  return (
    <section aria-labelledby="cards-title" className="flex flex-col gap-3">
      <SectionTitle
        id="cards-title"
        action={
          <div className="flex items-center gap-1">
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Oldingi karta"
              className="hidden sm:inline-flex"
              disabled={index === 0}
              onClick={() => scrollTo(Math.max(0, index - 1))}
            >
              <ChevronLeft aria-hidden="true" />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Keyingi karta"
              className="hidden sm:inline-flex"
              disabled={index >= total - 1}
              onClick={() => scrollTo(Math.min(total - 1, index + 1))}
            >
              <ChevronRight aria-hidden="true" />
            </IconButton>
            <Button asChild variant="link" size="sm" className="ml-1">
              <Link href={href('/cards')}>Boshqarish</Link>
            </Button>
          </div>
        }
      >
        Kartalarim
      </SectionTitle>
      <ul
        ref={scroller}
        onScroll={handleScroll}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {cards.map((card) => (
          <li key={card.id} className="w-[85%] max-w-[340px] shrink-0 snap-start sm:w-[320px]">
            <Link
              href={href(`/history?card=${card.id}`)}
              aria-label={`${card.name}: operatsiyalar tarixi`}
              className="focus-ring block rounded-2xl transition-transform duration-base hover:-translate-y-0.5"
            >
              <BankCardVisual card={card} hideBalance={hideBalance} />
            </Link>
          </li>
        ))}
        <li className="w-[85%] max-w-[340px] shrink-0 snap-start sm:w-[320px]">
          <Link
            href={href('/cards?add=1')}
            className="focus-ring flex aspect-[1.586] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-strong text-text-muted transition-colors duration-base hover:border-primary hover:text-primary-soft-foreground"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
              <Plus aria-hidden="true" className="size-5" />
            </span>
            <span className="text-sm font-semibold">Karta qo&apos;shish</span>
            <span className="text-xs">Uzcard, Humo, Visa, Mastercard</span>
          </Link>
        </li>
      </ul>
      <div aria-hidden="true" className="flex justify-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-base',
              i === index ? 'w-5 bg-primary' : 'w-1.5 bg-border-strong',
            )}
          />
        ))}
      </div>
    </section>
  );
}

const quickActions: { label: string; path: string; icon: LucideIcon }[] = [
  { label: "O'tkazma", path: '/transfer', icon: ArrowLeftRight },
  { label: "To'lov", path: '/payments', icon: ReceiptText },
  { label: "Karta qo'shish", path: '/cards?add=1', icon: Plus },
  { label: 'Tarix', path: '/history', icon: History },
];

function QuickActions() {
  const href = useBankHref();
  return (
    <nav aria-label="Tezkor amallar">
      <ul className="grid grid-cols-4 gap-2 sm:gap-3">
        {quickActions.map((a) => (
          <li key={a.label}>
            <Link
              href={href(a.path)}
              className="focus-ring group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-1 py-3.5 text-center shadow-xs transition-[border-color,box-shadow] duration-base hover:border-border-strong hover:shadow-md"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground transition-transform duration-base group-hover:scale-105">
                <a.icon aria-hidden="true" className="size-5" />
              </span>
              <span className="text-xs font-semibold text-text sm:text-sm">{a.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function QuickTransfer() {
  const href = useBankHref();
  return (
    <Card padding="sm" className="gap-3">
      <SectionTitle id="quick-title">Tezkor o&apos;tkazma</SectionTitle>
      <ul
        aria-labelledby="quick-title"
        className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]"
      >
        {contacts.map((c) => (
          <li key={c.id}>
            <Link
              href={href(`/transfer?to=${c.id}`)}
              className="focus-ring flex w-16 flex-col items-center gap-1.5 rounded-xl py-1 text-center"
            >
              <Avatar name={c.name} size="lg" />
              <span className="w-full truncate text-xs font-medium text-text">
                {c.name.split(' ')[0]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MonthSpending() {
  const { transactions, hideBalance } = useBank();
  const href = useBankHref();
  const top = useMemo(() => {
    const now = new Date();
    const sums = new Map<CategoryId, number>();
    for (const tx of transactions) {
      const d = new Date(tx.date);
      if (tx.amount >= 0 || tx.status !== 'success') continue;
      if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) continue;
      sums.set(tx.category, (sums.get(tx.category) ?? 0) - tx.amount);
    }
    const list = [...sums].sort((a, b) => b[1] - a[1]);
    const total = list.reduce((s, [, v]) => s + v, 0);
    return { list: list.slice(0, 4), total };
  }, [transactions]);

  return (
    <Card padding="sm" className="gap-3">
      <SectionTitle
        action={
          <Button asChild variant="link" size="sm">
            <Link href={href('/analytics')}>Tahlil</Link>
          </Button>
        }
      >
        {formatDate(new Date(), 'MMMM')} xarajatlari
      </SectionTitle>
      <ul className="flex flex-col gap-3">
        {top.list.map(([id, value]) => (
          <li key={id} className="flex items-center gap-3">
            <CategoryIcon category={id} size="sm" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium text-text">{categories[id].label}</span>
                <Money value={value} hidden={hideBalance} className="text-text-muted" />
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${top.total ? (value / top.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function RecentTransactions({ onSelect }: { onSelect: (tx: Transaction) => void }) {
  const { transactions, hideBalance } = useBank();
  const href = useBankHref();
  return (
    <Card padding="sm" className="gap-2">
      <SectionTitle
        id="recent-title"
        action={
          <Button asChild variant="link" size="sm">
            <Link href={href('/history')}>Barchasi</Link>
          </Button>
        }
      >
        So&apos;nggi operatsiyalar
      </SectionTitle>
      <ul aria-labelledby="recent-title" className="-mx-2 flex flex-col">
        {transactions.slice(0, 7).map((tx) => (
          <li key={tx.id}>
            <TxRow tx={tx} onSelect={onSelect} hidden={hideBalance} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function HomeView() {
  const [selected, setSelected] = useState<Transaction | null>(null);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Asosiy sahifa</h1>
      <BalanceHero />
      <CardsCarousel />
      <QuickActions />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px] [&>*]:min-w-0">
        <RecentTransactions onSelect={setSelected} />
        <div className="flex flex-col gap-5">
          <QuickTransfer />
          <MonthSpending />
        </div>
      </div>
      <TxDetailsDrawer tx={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
