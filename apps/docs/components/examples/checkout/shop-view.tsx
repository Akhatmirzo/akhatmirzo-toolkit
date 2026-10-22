'use client';

import { searchMatch } from '@akhatmirzo/core';
import { useDebounce } from '@akhatmirzo/hooks';
import { Button, Input, Select, Skeleton, cn } from '@akhatmirzo/ui';
import { BadgePercent, PackageSearch, Search, ShieldCheck, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { categories, products, type CategoryId } from './data';
import { ProductCard } from './product-card';

type SortId = 'popular' | 'cheap' | 'expensive' | 'rating';

const sorters: Record<
  SortId,
  (a: (typeof products)[number], b: (typeof products)[number]) => number
> = {
  popular: (a, b) => b.sold - a.sold,
  cheap: (a, b) => a.price - b.price,
  expensive: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
};

/** Do'kon vitrinasi: banner, kategoriyalar, qidiruv, saralash va mahsulotlar to'ri */
export function ShopView() {
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortId>('popular');
  const [loading, setLoading] = useState(true);
  const debounced = useDebounce(query, 200);

  // Katalog "serverdan" kelayotgandek — skeleton ko'rsatish uchun soxta kechikish
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const visible = useMemo(
    () =>
      products
        .filter((p) => category === 'all' || p.category === category)
        .filter((p) => !debounced.trim() || searchMatch(p.name, debounced).match)
        .sort(sorters[sort]),
    [category, debounced, sort],
  );

  const resetFilters = () => {
    setCategory('all');
    setQuery('');
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-16">
      <section
        aria-labelledby="promo-title"
        className="relative isolate overflow-hidden rounded-2xl bg-primary px-5 py-6 text-primary-foreground shadow-md sm:px-10 sm:py-10"
      >
        <span
          aria-hidden="true"
          className="absolute -top-16 -right-10 -z-10 size-64 rounded-full bg-primary-foreground opacity-10"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-24 right-40 -z-10 size-56 rounded-full bg-primary-foreground opacity-[0.06]"
        />
        <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
          <BadgePercent aria-hidden="true" className="size-3.5" />
          Kuzgi chegirmalar
        </p>
        <h1
          id="promo-title"
          className="mt-3 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Birinchi xaridga 10% chegirma
        </h1>
        <p className="mt-2 max-w-lg text-sm opacity-90 sm:text-base">
          Savatchada{' '}
          <strong className="rounded bg-primary-foreground/15 px-1.5 py-0.5 font-mono">
            SALOM10
          </strong>{' '}
          promokodini kiriting. 500 000 so'mdan ortiq xaridlarda kuryer bepul.
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm opacity-90">
          <li className="flex items-center gap-2">
            <Truck aria-hidden="true" className="size-4" /> Butun O'zbekiston bo'ylab
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="size-4" /> Xavfsiz to'lov
          </li>
        </ul>
      </section>

      <section aria-labelledby="catalog-title" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="catalog-title" className="text-xl font-semibold">
              Katalog
            </h2>
            <p className="text-sm text-text-muted" aria-live="polite">
              {loading ? 'Yuklanmoqda…' : `${visible.length} ta mahsulot`}
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              clearable
              onClear={() => setQuery('')}
              leftIcon={<Search aria-hidden="true" />}
              placeholder="Mahsulot qidirish"
              aria-label="Mahsulot qidirish"
              className="min-w-0 flex-1 sm:w-64"
            />
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as SortId)}
              aria-label="Saralash"
              className="w-40 shrink-0"
            >
              <Select.Item value="popular">Ommabop</Select.Item>
              <Select.Item value="rating">Reyting bo'yicha</Select.Item>
              <Select.Item value="cheap">Arzonroq</Select.Item>
              <Select.Item value="expensive">Qimmatroq</Select.Item>
            </Select>
          </div>
        </div>

        <div
          role="group"
          aria-label="Kategoriyalar"
          className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
        >
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                'focus-ring h-9 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors duration-base',
                category === c.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-text-subtle hover:border-border-strong',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            aria-hidden="true"
            className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton.Text lines={2} className="mt-4" />
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-border-strong px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-text-muted">
              <PackageSearch aria-hidden="true" className="size-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold">Hech narsa topilmadi</h3>
            <p className="mt-1 max-w-sm text-sm text-text-muted">
              «{query}» bo'yicha mahsulot yo'q. Boshqa so'z bilan qidiring yoki filtrlarni tozalang.
            </p>
            <Button className="mt-5" onClick={resetFilters}>
              Filtrlarni tozalash
            </Button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
