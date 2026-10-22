'use client';

import { formatMoney } from '@akhatmirzo/core';
import { useMediaQuery } from '@akhatmirzo/hooks';
import { Button, Drawer, toast } from '@akhatmirzo/ui';
import { Download, Flag, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useBank } from './bank-store';
import { brandLabels, categories, shortCard, type Transaction } from './data';
import { downloadReceipt, shareReceipt } from './receipt';
import { CategoryIcon, DetailList, formatDateTime, Money, StatusBadge } from './ui';

/** Operatsiya tafsiloti: desktop'da o'ngdan, telefonda pastdan chiqadi */
export function TxDetailsDrawer({ tx, onClose }: { tx: Transaction | null; onClose: () => void }) {
  const { findCard } = useBank();
  // Yopilish animatsiyasi paytida oxirgi operatsiya ko'rinib turishi uchun
  const [shown, setShown] = useState(tx);
  if (tx && tx !== shown) setShown(tx);
  const desktop = useMediaQuery('(min-width: 1024px)');
  const card = shown ? findCard(shown.cardId) : undefined;

  return (
    <Drawer open={tx !== null} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content
        side={desktop ? 'right' : 'bottom'}
        size={desktop ? 'md' : 'lg'}
        title="Operatsiya tafsiloti"
      >
        {shown && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-muted px-4 py-6 text-center">
              <CategoryIcon category={shown.category} size="lg" />
              <p className="mt-1 text-sm font-medium text-text-muted">{shown.title}</p>
              <Money
                value={shown.amount}
                signed
                className={
                  shown.amount > 0
                    ? 'text-3xl font-bold text-success-soft-foreground'
                    : 'text-3xl font-bold text-text'
                }
              />
              <StatusBadge status={shown.status} />
            </div>

            <DetailList
              items={[
                { label: 'Turi', value: shown.description },
                { label: 'Toifa', value: categories[shown.category].label },
                { label: 'Sana', value: formatDateTime(shown.date) },
                {
                  label: 'Karta',
                  value: card
                    ? `${card.name} · ${brandLabels[card.brand]} ${shortCard(card.number)}`
                    : "O'chirilgan karta",
                },
                ...(shown.counterparty ? [{ label: 'Kontragent', value: shown.counterparty }] : []),
                { label: 'Komissiya', value: formatMoney(shown.fee) },
                ...(shown.comment ? [{ label: 'Izoh', value: shown.comment }] : []),
                {
                  label: 'Tranzaksiya ID',
                  value: <span className="text-xs tracking-wide tabular-nums">{shown.id}</span>,
                },
              ]}
            />

            {shown.status === 'failed' && (
              <p className="rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger-soft-foreground">
                Operatsiya bank tomonidan rad etildi, mablag&apos; kartadan yechilmadi.
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button leftIcon={<Share2 />} onClick={() => shareReceipt(shown, card)}>
                Ulashish
              </Button>
              <Button leftIcon={<Download />} onClick={() => downloadReceipt(shown, card)}>
                Yuklab olish
              </Button>
              <Button
                variant="ghost"
                className="col-span-2"
                leftIcon={<Flag />}
                onClick={() =>
                  toast.info('Murojaat qabul qilindi', {
                    description: "Operator 15 daqiqa ichida siz bilan bog'lanadi.",
                  })
                }
              >
                Muammo haqida xabar berish
              </Button>
            </div>
          </div>
        )}
      </Drawer.Content>
    </Drawer>
  );
}
