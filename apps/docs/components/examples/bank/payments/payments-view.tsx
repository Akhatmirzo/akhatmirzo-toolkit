'use client';

import { formatMoney, searchMatch } from '@akhatmirzo/core';
import { Card, confirm, IconButton, Input, toast, Tooltip } from '@akhatmirzo/ui';
import { ChevronRight, Search, SearchX, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useBank } from '../bank-store';
import { findService, serviceGroups, services, type Favorite } from '../data';
import { EmptyState, PageHeader, SectionTitle } from '../ui';
import { formatAccount, PaymentDialog, type PaymentPreset } from './payment-dialog';
import { ServiceIcon } from './service-icon';

function FavoriteTile({
  favorite,
  onPay,
  onRemove,
}: {
  favorite: Favorite;
  onPay: () => void;
  onRemove: () => void;
}) {
  const service = findService(favorite.serviceId);
  if (!service) return null;
  return (
    <li className="relative w-56 shrink-0 snap-start">
      <button
        type="button"
        onClick={onPay}
        className="focus-ring flex w-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 pr-12 text-left shadow-xs transition-[border-color,box-shadow] duration-base hover:border-border-strong hover:shadow-md"
      >
        <ServiceIcon service={service} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-text">{favorite.label}</span>
          <span className="truncate text-xs text-text-muted tabular-nums">
            {service.title} · {formatAccount(service, favorite.account)}
          </span>
          {favorite.amount && (
            <span className="mt-1 text-xs font-medium text-text-subtle">
              {formatMoney(favorite.amount)}
            </span>
          )}
        </span>
      </button>
      <Tooltip content="O'chirish">
        <IconButton
          size="sm"
          variant="ghost"
          aria-label={`${favorite.label} — sevimlilardan o'chirish`}
          className="absolute top-3 right-3"
          onClick={onRemove}
        >
          <Trash2 aria-hidden="true" />
        </IconButton>
      </Tooltip>
    </li>
  );
}

export function PaymentsView() {
  const { favorites, removeFavorite } = useBank();
  const [query, setQuery] = useState('');
  const [preset, setPreset] = useState<PaymentPreset | null>(null);

  const visible = services.filter((s) => searchMatch(`${s.title} ${s.provider}`, query).match);

  const handleRemove = async (fav: Favorite) => {
    const ok = await confirm({
      title: "Sevimlilardan o'chirilsinmi?",
      description: `"${fav.label}" ro'yxatdan olib tashlanadi. To'lovlar tarixi saqlanib qoladi.`,
      confirmText: "O'chirish",
      variant: 'danger',
    });
    if (!ok) return;
    removeFavorite(fav.id);
    toast.success("Sevimlilardan o'chirildi");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="To'lovlar" description="Aloqa, internet, kommunal va davlat xizmatlari" />

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        leftIcon={<Search />}
        placeholder="Xizmatni qidirish: gaz, Beeline, jarima..."
        aria-label="Xizmatni qidirish"
        clearable
        onClear={() => setQuery('')}
        size="lg"
      />

      {!query && (
        <section aria-labelledby="fav-title" className="flex flex-col gap-3">
          <SectionTitle id="fav-title">Sevimli to&apos;lovlar</SectionTitle>
          {favorites.length ? (
            <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              {favorites.map((f) => {
                const service = findService(f.serviceId);
                return (
                  <FavoriteTile
                    key={f.id}
                    favorite={f}
                    onPay={() => service && setPreset({ service, favorite: f })}
                    onRemove={() => handleRemove(f)}
                  />
                );
              })}
            </ul>
          ) : (
            <Card variant="soft" padding="none">
              <EmptyState
                icon={Star}
                title="Sevimlilar yo'q"
                description={`To'lov paytida "Sevimlilarga saqlash" belgisini qo'ying — keyingi safar bir bosishda to'laysiz.`}
              />
            </Card>
          )}
        </section>
      )}

      {visible.length === 0 ? (
        <Card variant="outline" padding="none">
          <EmptyState
            icon={SearchX}
            title="Hech narsa topilmadi"
            description={`"${query}" bo'yicha xizmat yo'q. Boshqa so'z bilan qidirib ko'ring.`}
          />
        </Card>
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-2">
          {serviceGroups.map((group) => {
            const items = visible.filter((s) => s.group === group.id);
            if (!items.length) return null;
            return (
              <section key={group.id} aria-labelledby={`group-${group.id}`}>
                <Card padding="sm" className="gap-2">
                  <div className="px-1">
                    <h2 id={`group-${group.id}`} className="text-base font-semibold text-text">
                      {group.title}
                    </h2>
                    <p className="text-xs text-text-muted">{group.description}</p>
                  </div>
                  <ul className="flex flex-col">
                    {items.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => setPreset({ service: s })}
                          className="focus-ring flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left transition-colors duration-fast hover:bg-surface-muted"
                        >
                          <ServiceIcon service={s} />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-semibold text-text">
                              {s.title}
                            </span>
                            <span className="truncate text-xs text-text-muted">{s.provider}</span>
                          </span>
                          <ChevronRight aria-hidden="true" className="size-4 text-text-faint" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>
            );
          })}
        </div>
      )}

      <PaymentDialog preset={preset} onClose={() => setPreset(null)} />
    </div>
  );
}
